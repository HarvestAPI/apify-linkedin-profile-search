import { SearchLinkedInSalesNavLeadsParams } from '@harvestapi/scraper';
import { Actor } from 'apify';
import { styleText } from 'node:util';
import { ProfileScraperMode } from './types.js';

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
}

export async function handleInput({ isPaying }: { isPaying: boolean }) {
  // Structure of input is defined in input_schema.json
  const input = await Actor.getInput<Input>();
  if (!input) throw new Error('Input is missing!');

  const profileScraperMode =
    profileScraperModeInputMap1[input.profileScraperMode] ??
    profileScraperModeInputMap2[input.profileScraperMode] ??
    ProfileScraperMode.FULL;

  input.searchQuery =
    (input.searchQuery || '').trim() || (input.searchQueries || [])[0]?.trim() || '';

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

  return {
    profileScraperMode,
    scraperQuery,
    isFreeUserExceeding,
    maxItems: input.maxItems,
    startPage: input.startPage || 1,
    takePages: input.takePages || 100,
  };
}
