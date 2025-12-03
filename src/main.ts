// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/).
import { createLinkedinScraper } from '@harvestapi/scraper';
import { Actor } from 'apify';
import { config } from 'dotenv';
import crypto from 'node:crypto';
import { styleText } from 'node:util';
import { fetchItem } from './utils/fetchItem.js';
import { handleInput } from './utils/input.js';
import { pushItem } from './utils/pushItem.js';
import { ProfileScraperMode } from './utils/types.js';

config();

// The init() call configures the Actor for its environment. It's recommended to start every Actor with an init().
await Actor.init();

const { actorId, actorRunId, actorBuildId, userId, memoryMbytes } = Actor.getEnv();
const client = Actor.newClient();
const user = userId ? await client.user(userId).get() : null;
const cm = Actor.getChargingManager();
const pricingInfo = cm.getPricingInfo();
const isPaying = (user as Record<string, any> | null)?.isPaying === false ? false : true;
const runCounterStore = await Actor.openKeyValueStore('run-counter-store');

if (pricingInfo.maxTotalChargeUsd < 0.1) {
  console.warn(
    'Warning: The maximum total charge is set to less than $0.1, which will not be sufficient for scraping LinkedIn profiles.',
  );
  await Actor.exit({
    statusMessage: 'max charge reached',
  });
}

const processedInput = await handleInput({ isPaying });
const { profileScraperMode, scraperQuery, isFreeUserExceeding, maxItems, takePages, startPage } =
  processedInput;

let totalRuns = 0;
if (userId) {
  if (!isPaying) {
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 4000));
  }
  totalRuns = Number(await runCounterStore.getValue(userId)) || 0;
  totalRuns++;
  await runCounterStore.setValue(userId, totalRuns);
}
let hitRateLimit = false;

const logFreeUserExceeding = () =>
  console.warn(
    styleText('bgYellow', ' [WARNING] ') +
      ' Free users are limited up to 25 items per run. Please upgrade to a paid plan to scrape more items.',
  );

if (!isPaying) {
  if (totalRuns > 10) {
    console.warn(
      styleText('bgYellow', ' [WARNING] ') +
        ' Free users are limited to 10 runs. Please upgrade to a paid plan to run more.',
    );
    await Actor.exit({
      statusMessage: 'free user run limit reached',
    });
  }
}

const state: {
  scrapedPageNumber?: number;
} = (await Actor.getValue('crawling-state')) || {
  scrapedPageNumber: undefined,
};

Actor.on('migrating', async () => {
  await Actor.setValue('crawling-state', state);
  await Actor.reboot();
});

if (isFreeUserExceeding) {
  logFreeUserExceeding();
}

const scraper = createLinkedinScraper({
  apiKey: process.env.HARVESTAPI_TOKEN!,
  baseUrl: process.env.HARVESTAPI_URL || 'https://api.harvest-api.com',
  addHeaders: {
    'x-apify-userid': userId!,
    'x-apify-actor-id': actorId!,
    'x-apify-actor-run-id': actorRunId!,
    'x-apify-actor-build-id': actorBuildId!,
    'x-apify-memory-mbytes': String(memoryMbytes),
    'x-apify-username': user?.username || '',
    'x-apify-user-is-paying': (user as Record<string, any> | null)?.isPaying,
    'x-apify-user-is-paying2': String(isPaying),
    'x-apify-max-total-charge-usd': String(pricingInfo.maxTotalChargeUsd),
    'x-apify-is-pay-per-event': String(pricingInfo.isPayPerEvent),
    'x-apify-user-runs': String(totalRuns),
    'x-apify-user-max-items': String(maxItems),
    'x-apify-user-profile-scraper-mode': String(profileScraperMode),
  },
});

await scraper.scrapeSalesNavigatorLeads({
  query: scraperQuery,
  maxItems,
  findEmail: profileScraperMode === ProfileScraperMode.EMAIL,
  outputType: 'callback',
  disableLog: true,
  overrideConcurrency: 15,
  overridePageConcurrency: 1,
  warnPageLimit: isPaying,
  startPage: state.scrapedPageNumber || startPage || 1,
  takePages: isPaying ? takePages : 1,
  sessionId: crypto.randomUUID(),
  addListingHeaders: {
    'x-sub-user': user?.username || '',
    'x-concurrency': user?.username ? (isPaying ? '3' : '1') : (undefined as any),
    'x-queue-size': isPaying ? '30' : '2',
    'x-request-timeout': '360',
  },
  onItemScraped: async ({ item, payments, pagination }) => {
    return pushItem({ item, payments: payments || [], pagination, profileScraperMode });
  },
  optionsOverride: {
    fetchItem: async ({ item }) => {
      return fetchItem({ item, processedInput, scraper });
    },
  },
  onPageFetched: async ({ page, data }) => {
    if (page === 1) {
      if (data?.status === 429) {
        console.error('Too many requests');
      } else if (data?.pagination) {
        console.info(
          `Found ${data.pagination.totalElements} profiles total for input ${JSON.stringify(scraperQuery)}`,
        );
      }

      if (typeof data?.error === 'string' && data.error.includes('No available resource')) {
        hitRateLimit = true;

        console.error(
          `We've hit LinkedIn rate limits due to the active usage from our Apify users. Rate limits reset hourly. Please continue at the beginning of the next hour.`,
        );
        return;
      }
    }

    if (data?.pagination && data?.status !== 429) {
      const pushResult = await Actor.charge({ eventName: 'search-page' });
      if (pushResult.eventChargeLimitReached) {
        await Actor.exit({
          statusMessage: 'max charge reached',
        });
      } else {
        state.scrapedPageNumber = page;
        await Actor.setValue('crawling-state', state);
      }
    }
    console.info(
      `Scraped search page ${page}. Found ${data?.elements?.length} profiles on the page.`,
    );
  },
});

if (isFreeUserExceeding) {
  logFreeUserExceeding();
}

await new Promise((resolve) => setTimeout(resolve, 1000));
// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit().
await Actor.exit({
  statusMessage: hitRateLimit ? 'rate limited' : 'success',
});
