// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/).
import {
  ApiItemResponse,
  createLinkedinScraper,
  Profile,
  ProfileShort,
  ScrapeLinkedinSalesNavLeadsParams,
} from '@harvestapi/scraper';
import { Actor } from 'apify';
import { config } from 'dotenv';
import { styleText } from 'node:util';

config();

// The init() call configures the Actor for its environment. It's recommended to start every Actor with an init().
await Actor.init();

enum ProfileScraperMode {
  SHORT,
  FULL,
  EMAIL,
}

const profileScraperModeInputMap1: Record<string, ProfileScraperMode> = {
  'Short ($4 per 1k)': ProfileScraperMode.SHORT,
  'Full ($8 per 1k)': ProfileScraperMode.FULL,
  'Full + email search ($12 per 1k)': ProfileScraperMode.EMAIL,
};
const profileScraperModeInputMap2: Record<string, ProfileScraperMode> = {
  '1': ProfileScraperMode.SHORT,
  '2': ProfileScraperMode.FULL,
  '3': ProfileScraperMode.EMAIL,
};

interface Input {
  profileScraperMode: string;
  searchQueries?: string[];
  currentCompanies?: string[];
  pastCompanies?: string[];
  currentJobTitles?: string[];
  pastJobTitles?: string[];
  firstNames?: string[];
  lastNames?: string[];
  schools?: string[];
  locations?: string[];
  maxItems?: number;
}

// Structure of input is defined in input_schema.json
const input = await Actor.getInput<Input>();
if (!input) throw new Error('Input is missing!');

const profileScraperMode =
  profileScraperModeInputMap1[input.profileScraperMode] ??
  profileScraperModeInputMap2[input.profileScraperMode] ??
  ProfileScraperMode.FULL;

input.searchQueries = (input.searchQueries || []).filter((q) => q && !!q.trim());

const query: {
  currentCompanies: string[];
  pastCompanies: string[];
  schools: string[];
  location: string[];
  currentJobTitles: string[];
  pastJobTitles: string[];
  firstNames: string[];
  lastNames: string[];
} = {
  currentCompanies: input.currentCompanies || [],
  pastCompanies: input.pastCompanies || [],
  schools: input.schools || [],
  location: input.locations || [],
  currentJobTitles: input.currentJobTitles || [],
  pastJobTitles: input.pastJobTitles || [],
  firstNames: input.firstNames || [],
  lastNames: input.lastNames || [],
};

for (const key of Object.keys(query) as (keyof typeof query)[]) {
  if (Array.isArray(query[key]) && query[key].length) {
    query[key] = query[key]
      .map((v) => (v || '').replace(/,/g, ' ').replace(/\s+/g, ' ').trim())
      .filter((v) => v && v.length);
  }
}

const { actorId, actorRunId, actorBuildId, userId, actorMaxPaidDatasetItems, memoryMbytes } =
  Actor.getEnv();
const client = Actor.newClient();

const user = userId ? await client.user(userId).get() : null;
const cm = Actor.getChargingManager();
const pricingInfo = cm.getPricingInfo();
const isPaying = (user as Record<string, any> | null)?.isPaying === false ? false : true;
const runCounterStore = await Actor.openKeyValueStore('run-counter-store');

let totalRuns = 0;
if (userId) {
  totalRuns = Number(await runCounterStore.getValue(userId)) || 0;
  totalRuns++;
}

const state: {
  lastPromise: Promise<any> | null;
  leftItems: number;
} = {
  lastPromise: null,
  leftItems: actorMaxPaidDatasetItems || 1000000,
};
if (input.maxItems && input.maxItems < state.leftItems) {
  state.leftItems = input.maxItems;
}

let isFreeUserExceeding = false;
const logFreeUserExceeding = () =>
  console.warn(
    styleText('bgYellow', ' [WARNING] ') +
      ' Free users are limited up to 50 items per run. Please upgrade to a paid plan to scrape more items.',
  );

if (!isPaying) {
  if (totalRuns > 10) {
    console.warn(
      styleText('bgYellow', ' [WARNING] ') +
        ' Free users are limited to 10 runs. Please upgrade to a paid plan to run more.',
    );
    await Actor.exit();
    process.exit(0);
  }

  if (state.leftItems > 50) {
    isFreeUserExceeding = true;
    state.leftItems = 50;
    logFreeUserExceeding();
  }
}

const pushItem = async (item: Profile | ProfileShort, payments: string[]) => {
  console.info(
    `Scraped profile ${item.linkedinUrl || item?.publicIdentifier || item?.id}`,
    payments,
  );

  if (pricingInfo.isPayPerEvent) {
    if (profileScraperMode === ProfileScraperMode.SHORT) {
      state.lastPromise = Actor.pushData(item, 'short-profile');
    }
    if (profileScraperMode === ProfileScraperMode.FULL) {
      state.lastPromise = Actor.pushData(item, 'full-profile');
    }
    if (profileScraperMode === ProfileScraperMode.EMAIL) {
      state.lastPromise = Actor.pushData(item, 'full-profile');
      if ((payments || []).includes('linkedinProfileWithEmail')) {
        Actor.charge({ eventName: 'short-profile' });
      }
    }
  } else {
    state.lastPromise = Actor.pushData(item);
  }
};

const scraper = createLinkedinScraper({
  apiKey: process.env.HARVESTAPI_TOKEN!,
  baseUrl: process.env.HARVESTAPI_URL || 'https://api.harvest-api.com',
  addHeaders: {
    'x-apify-userid': userId!,
    'x-apify-actor-id': actorId!,
    'x-apify-actor-run-id': actorRunId!,
    'x-apify-actor-build-id': actorBuildId!,
    'x-apify-memory-mbytes': String(memoryMbytes),
    'x-apify-actor-max-paid-dataset-items': String(actorMaxPaidDatasetItems) || '0',
    'x-apify-username': user?.username || '',
    'x-apify-user-is-paying': (user as Record<string, any> | null)?.isPaying,
    'x-apify-user-is-paying2': String(isPaying),
    'x-apify-max-total-charge-usd': String(pricingInfo.maxTotalChargeUsd),
    'x-apify-is-pay-per-event': String(pricingInfo.isPayPerEvent),
    'x-apify-user-runs': String(totalRuns),
    'x-apify-user-left-items': String(state.leftItems),
    'x-apify-user-max-items': String(input.maxItems),
  },
});

const scrapeParams: Omit<ScrapeLinkedinSalesNavLeadsParams, 'query'> = {
  findEmail: profileScraperMode === ProfileScraperMode.EMAIL,
  outputType: 'callback',
  onItemScraped: async ({ item, payments }) => {
    return pushItem(item, payments || []);
  },
  optionsOverride: {
    fetchItem: async ({ item }) => {
      if (item?.id || item?.publicIdentifier) {
        state.leftItems -= 1;
        if (state.leftItems < 0) {
          return { skipped: true, done: true };
        }

        if (profileScraperMode === ProfileScraperMode.SHORT && item?.id) {
          return {
            status: 200,
            entityId: item.id || item.publicIdentifier,
            element: item,
          } as ApiItemResponse<Profile>;
        }

        return scraper.getProfile({
          url: `https://www.linkedin.com/in/${item.publicIdentifier || item.id}`,
          findEmail: profileScraperMode === ProfileScraperMode.EMAIL,
        });
      }

      return { skipped: true };
    },
  },
  disableLog: true,
  overrideConcurrency: profileScraperMode === ProfileScraperMode.EMAIL ? 10 : 8,
  overridePageConcurrency: state.leftItems > 200 ? 2 : 1,
  warnPageLimit: isPaying,
};

let didChargeForStats = false;

for (const searchQuery of input.searchQueries.length ? input.searchQueries : ['']) {
  if (state.leftItems <= 0) {
    break;
  }

  const itemQuery = {
    search: searchQuery,
    ...query,
  };
  for (const key of Object.keys(itemQuery) as (keyof typeof itemQuery)[]) {
    if (!itemQuery[key]) {
      delete itemQuery[key];
    }
    if (Array.isArray(itemQuery[key])) {
      if (!itemQuery[key].length) {
        delete itemQuery[key];
      }
    }
  }

  if (!Object.keys(itemQuery).length) {
    console.warn(
      'Please provide at least one search query or filter. Nothing to search, skipping...',
    );
    continue;
  }

  await scraper.scrapeSalesNavigatorLeads({
    query: itemQuery,
    ...scrapeParams,
    maxItems: state.leftItems,
    onFirstPageFetched: ({ data }) => {
      if (data?.status === 429) {
        console.error('Too many requests');
      } else if (data?.pagination) {
        if (!didChargeForStats) {
          didChargeForStats = true;
          Actor.charge({ eventName: 'actor-start' });
        }

        console.info(
          `Found ${data.pagination.totalElements} profiles total for input ${JSON.stringify(itemQuery)}`,
        );
      }
    },
    addListingHeaders: {
      'x-sub-user': user?.username || '',
      'x-concurrency': user?.username ? '1' : (undefined as any),
      'x-queue-size': isPaying ? '30' : '5',
      'x-request-timeout': '360',
    },
  });
}

await state.lastPromise;

if (userId) {
  totalRuns = Number(await runCounterStore.getValue(userId)) || 0;
  totalRuns++;
  await runCounterStore.setValue(userId, totalRuns);
}

if (isFreeUserExceeding) {
  logFreeUserExceeding();
}

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit().
await Actor.exit();
// process.exit(0);
