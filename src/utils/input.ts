import { SearchLinkedInSalesNavLeadsParams } from '@harvestapi/scraper';
import { Actor } from 'apify';
import { styleText } from 'node:util';
import { ProfileScraperMode } from './types.js';
import { Collection, MongoClient } from 'mongodb';

const profileScraperModeInputMap1: Record<string, ProfileScraperMode> = {
  'Short ($4 per 1k)': ProfileScraperMode.SHORT,
  'Full ($8 per 1k)': ProfileScraperMode.FULL,
  'Full + email search ($12 per 1k)': ProfileScraperMode.EMAIL,

  Short: ProfileScraperMode.SHORT,
  Full: ProfileScraperMode.FULL,
  'Full + email search': ProfileScraperMode.EMAIL,
};
const profileScraperModeInputMap2: Record<string, ProfileScraperMode> = {
  '1': ProfileScraperMode.SHORT,
  '2': ProfileScraperMode.FULL,
  '3': ProfileScraperMode.EMAIL,
};

interface Input {
  profileScraperMode: string;
  searchQuery?: string;
  searchQueries?: string[]; // Deprecated, use searchQuery instead
  currentCompanies?: string[];
  pastCompanies?: string[];
  currentJobTitles?: string[];
  pastJobTitles?: string[];
  firstNames?: string[];
  lastNames?: string[];
  schools?: string[];
  locations?: string[];
  industryIds?: string[];
  yearsOfExperienceIds?: string[];
  yearsAtCurrentCompanyIds?: string[];
  seniorityLevelIds?: string[];
  functionIds?: string[];
  recentlyChangedJobs?: boolean;
  profileLanguages?: string[];

  excludeCurrentCompanies?: string[];
  excludePastCompanies?: string[];
  excludeLocations?: string[];
  excludeGeoIds?: string[];
  excludeSchools?: string[];
  excludeCurrentJobTitles?: string[];
  excludePastJobTitles?: string[];
  excludeIndustryIds?: string[];
  excludeSeniorityLevelIds?: string[];
  excludeFunctionIds?: string[];

  maxItems?: number;
  startPage?: number;
  takePages?: number;
  salesNavUrl?: string;

  mongoDbConnectionString?: string;
  profileDeduplicationMode?: 'off' | 'read_only' | 'insert_ids' | 'insert_profiles';
}

export type ProcessedInput = {
  profileScraperMode: ProfileScraperMode;
  scraperQuery: SearchLinkedInSalesNavLeadsParams;
  isFreeUserExceeding: boolean;
  maxItems: number;
  startPage: number;
  takePages: number;
  mongoDbConnectionString?: string;
  profileDeduplicationMode: 'off' | 'read_only' | 'insert_ids' | 'insert_profiles';
  mongoClient?: MongoClient;
  mongoProfilesCollection?: Collection<{ profileId?: string; salesNavId?: string }>;
};

export async function handleInput({ isPaying }: { isPaying: boolean }): Promise<ProcessedInput> {
  // Structure of input is defined in input_schema.json
  const input = await Actor.getInput<Input>();
  if (!input) throw new Error('Input is missing!');

  const profileScraperMode =
    profileScraperModeInputMap1[input.profileScraperMode] ??
    profileScraperModeInputMap2[input.profileScraperMode] ??
    ProfileScraperMode.FULL;

  if (input.searchQueries?.length) {
    console.error('The "searchQueries" input is deprecated. Please use "searchQuery" instead.');
    await Actor.exit({ statusMessage: 'deprecated input used', exitCode: 1 });
  }

  input.searchQuery = (input.searchQuery || '').trim() || '';

  const query: Partial<SearchLinkedInSalesNavLeadsParams> = {
    currentCompanies: input.currentCompanies || [],
    pastCompanies: input.pastCompanies || [],
    schools: input.schools || [],
    locations: input.locations || [],
    currentJobTitles: input.currentJobTitles || [],
    pastJobTitles: input.pastJobTitles || [],
    firstNames: input.firstNames || [],
    lastNames: input.lastNames || [],
    industryIds: input.industryIds || [],
    salesNavUrl: input.salesNavUrl,
    yearsOfExperienceIds: input.yearsOfExperienceIds || [],
    yearsAtCurrentCompanyIds: input.yearsAtCurrentCompanyIds || [],
    seniorityLevelIds: input.seniorityLevelIds || [],
    functionIds: input.functionIds || [],
    profileLanguages: input.profileLanguages || [],
    recentlyChangedJobs: input.recentlyChangedJobs,

    excludeCurrentCompanies: input.excludeCurrentCompanies || [],
    excludePastCompanies: input.excludePastCompanies || [],
    excludeLocations: input.excludeLocations || [],
    excludeGeoIds: input.excludeGeoIds || [],
    excludeSchools: input.excludeSchools || [],
    excludeCurrentJobTitles: input.excludeCurrentJobTitles || [],
    excludePastJobTitles: input.excludePastJobTitles || [],
    excludeIndustryIds: input.excludeIndustryIds || [],
    excludeSeniorityLevelIds: input.excludeSeniorityLevelIds || [],
    excludeFunctionIds: input.excludeFunctionIds || [],
  };

  for (const key of Object.keys(query) as (keyof typeof query)[]) {
    if (Array.isArray(query[key]) && query[key].length) {
      (query[key] as string[]) = query[key]
        .map((v) => (v || '').replace(/,/g, ' ').replace(/\s+/g, ' ').trim())
        .filter((v) => v && v.length);
    }
    if (typeof query[key] === 'string') {
      (query[key] as string) = query[key].replace(/\s+/g, ' ').trim();
    }
  }

  const scraperQuery: SearchLinkedInSalesNavLeadsParams = {
    search: input.searchQuery || '',
    ...query,
  };
  for (const key of Object.keys(scraperQuery) as (keyof typeof scraperQuery)[]) {
    if (!scraperQuery[key]) {
      delete scraperQuery[key];
    }
    if (Array.isArray(scraperQuery[key])) {
      if (!scraperQuery[key].length) {
        delete scraperQuery[key];
      }
    }
  }

  if (!Object.keys(scraperQuery).length) {
    console.warn(
      'Please provide at least one search query or filter. Nothing to search, skipping...',
    );
    await Actor.exit({ statusMessage: 'no query' });
  }

  if (!input.maxItems) input.maxItems = 1000000;

  let isFreeUserExceeding = false;

  if (!isPaying) {
    if (input.maxItems > 25) {
      isFreeUserExceeding = true;
      input.maxItems = 25;
    }
  }

  if (input.maxItems <= 0) {
    console.warn(
      styleText('bgYellow', ' [WARNING] ') +
        ' No items left to scrape. Please increase the maxItems input or reduce the filters.',
    );
    await Actor.exit({ statusMessage: 'no items' });
  }

  const processedInput: ProcessedInput = {
    profileScraperMode,
    scraperQuery,
    isFreeUserExceeding,
    maxItems: input.maxItems,
    startPage: input.startPage || 1,
    takePages: input.takePages || 100,
    mongoDbConnectionString: input.mongoDbConnectionString,
    profileDeduplicationMode: input.profileDeduplicationMode || 'off',
  };

  if (
    input.mongoDbConnectionString &&
    processedInput.profileDeduplicationMode &&
    processedInput.profileDeduplicationMode !== 'off'
  ) {
    const mongoClient = new MongoClient(input.mongoDbConnectionString);
    await mongoClient.connect();
    const db = mongoClient.db('harvestapi');
    const profilesCollection = db.collection<{ profileId?: string; salesNavId?: string }>(
      'linkedin_profiles',
    );
    processedInput.mongoClient = mongoClient;
    processedInput.mongoProfilesCollection = profilesCollection;

    const profile_id_idx = await profilesCollection.createIndex(
      { profileId: 1 },
      { name: 'profile_id_idx', background: true },
    );
    console.info(`Index '${profile_id_idx}' is ensured to exist.`);

    const sales_nav_id_idx = await profilesCollection.createIndex(
      { salesNavId: 1 },
      { name: 'sales_nav_id_idx', background: true },
    );
    console.info(`Index '${sales_nav_id_idx}' is ensured to exist.`);
  }

  if (
    processedInput.profileDeduplicationMode &&
    processedInput.profileDeduplicationMode !== 'off' &&
    !processedInput.mongoDbConnectionString
  ) {
    console.warn(
      styleText('bgYellow', ' [WARNING] ') +
        ' Deduplication is enabled, but MongoDB connection string is not provided. \n Please check the Information section https://console.apify.com/actors/M2FMdjRVeF1HPGFcc/information/latest/readme#deduplication.',
    );
    await Actor.exit({ statusMessage: 'no mongo connection string' });
  }

  return processedInput;
}
