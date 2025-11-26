import { ApiItemResponse, LinkedinScraper, Profile, ProfileShort } from '@harvestapi/scraper';
import { ProcessedInput } from './input.js';
import { ProfileScraperMode } from './types.js';
import { Actor } from 'apify';

export async function fetchItem({
  item,
  processedInput,
  scraper,
}: {
  item: ProfileShort;
  processedInput: ProcessedInput;
  scraper: LinkedinScraper;
}): Promise<
  | (
      | ApiItemResponse<
          Profile & {
            openProfile?: boolean;
          }
        >
      | {
          skipped: boolean;
          done?: boolean;
        }
    )
  | null
> {
  const { profileScraperMode, mongoProfilesCollection, profileDeduplicationMode } = processedInput;

  if (!item?.id) {
    return { skipped: true };
  }
  const skippedResult = {
    status: 204,
    entityId: item.id || item.publicIdentifier,
    element: { ...item, skipped: true } as Profile & { skipped?: boolean },
  } as ApiItemResponse<Profile>;

  if (profileDeduplicationMode && mongoProfilesCollection && profileDeduplicationMode !== 'off') {
    const currentProfile = await mongoProfilesCollection.findOne({ salesNavId: item.id });

    if (currentProfile?.profileId) {
      console.info(
        `Skipping profile ${item.id} as it is already present in the database (code_1001).`,
      );
      return skippedResult;
    }

    if (profileDeduplicationMode !== 'read_only') {
      const insertResult = await mongoProfilesCollection
        .insertOne({ salesNavId: item.id })
        .catch((err) => {
          if (err.code === 11000) {
            // Duplicate key error, another run/process has inserted it meanwhile
            return { skipped: true };
          }
          console.error(`Error saving profile ${item.id}:`, err.message, err);
          return null;
        });
      if ((insertResult as { skipped: boolean })?.skipped) {
        console.info(
          `Skipping profile ${item.id} as it is already present in the database (code_1002).`,
        );
        return skippedResult;
      }
    }
  }

  if (profileScraperMode === ProfileScraperMode.SHORT && item?.id) {
    return {
      status: 200,
      entityId: item.id || item.publicIdentifier,
      element: item,
    } as ApiItemResponse<Profile>;
  }

  const profile = await scraper.getProfile({
    url: `https://www.linkedin.com/in/${item.publicIdentifier || item.id}`,
    findEmail: profileScraperMode === ProfileScraperMode.EMAIL,
  });

  if (!profile?.element?.id) {
    return profile;
  }

  if (profileDeduplicationMode && mongoProfilesCollection && profileDeduplicationMode !== 'off') {
    const currentProfile = await mongoProfilesCollection.findOne({ profileId: item.id });

    if (currentProfile?.profileId) {
      console.info(`Skipping full profile ${item.id} as it is already present in the database.`);
      if (profileScraperMode === ProfileScraperMode.EMAIL) {
        await Actor.charge({ eventName: 'full-profile-with-email' });
      } else {
        await Actor.charge({ eventName: 'full-profile' });
      }
      return skippedResult;
    }

    if (profileDeduplicationMode !== 'read_only') {
      await mongoProfilesCollection
        .updateOne(
          { salesNavId: item.id },
          {
            $set: {
              profileId: profile.element.id,
              ...(profileDeduplicationMode === 'insert_profiles' ? profile.element : {}),
            },
          },
        )
        .catch((err) => {
          console.error(`Error updating profile ${item.id}:`, err.message, err);
        });
    }
  }

  return {
    ...profile,
    element: {
      ...profile.element,
      openProfile: (item as any).openProfile,
    },
  };
}
