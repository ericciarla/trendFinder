/**
 * @module services/scrapeSources
 * @description Service responsible for scraping and processing content from various sources
 * including Twitter/X and web pages. Uses Together AI for content analysis and filtering.
 */

import {
  firecrawlClient,
  togetherClient,
  dateUtils,
  sourceConfig,
  xClient,
} from '../lib/clients';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

interface Story {
  /** The main text or title of the story */
  headline: string;
  /** URL linking to the original content */
  link: string;
  /** ISO timestamp of when the story was posted */
  date_posted: string;
}

interface CombinedStories {
  /** Array of stories collected from various sources */
  stories: Story[];
}

type FirecrawlFormat =
  | 'markdown'
  | 'html'
  | 'rawHtml'
  | 'content'
  | 'links'
  | 'screenshot'
  | 'screenshot@fullPage'
  | 'extract';

// 1. Define the schema for your expected JSON
const StorySchema = z.object({
  headline: z.string().describe('Story or post headline'),
  link: z.string().describe('A link to the post or story'),
  date_posted: z.string().describe('The date the story or post was published'),
});

const StoriesSchema = z.object({
  stories: z
    .array(StorySchema)
    .describe("A list of today's AI or LLM-related stories"),
});

// 2. Convert Zod schema to JSON Schema for Together's response_format
const jsonSchema = zodToJsonSchema(StoriesSchema, {
  name: 'StoriesSchema',
  nameStrategy: 'title',
});

/**
 * @function processTwitterSource
 * @description Processes a Twitter/X source by fetching recent tweets and converting them to stories
 * @param {string} source - Twitter profile URL to scrape
 * @param {CombinedStories} combinedText - Collection to store processed stories
 */
async function processTwitterSource(
  source: string,
  combinedText: CombinedStories
) {
  const usernameMatch = source.match(/x\.com\/([^\/]+)/);
  if (!usernameMatch) return;
  const username = usernameMatch[1];

  // Build the search query for Tweets
  const query = sourceConfig.twitter.buildQuery(username);
  const startTime = dateUtils.get24HoursAgo();
  const apiUrl = `https://api.x.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=${sourceConfig.twitter.maxResults}&start_time=${encodeURIComponent(startTime)}`;

  try {
    const response = await xClient.get(apiUrl);

    if (response.status !== 200) {
      throw new Error(
        `Failed to fetch tweets for ${username}: ${response.statusText}`
      );
    }

    const tweets = response.data;

    if (tweets.meta?.result_count === 0) {
      console.log(`ℹ️ No tweets found for username ${username}.`);
      return;
    }

    if (!Array.isArray(tweets.data)) {
      console.error('Expected tweets.data to be an array:', tweets.data);
      return;
    }

    console.log(`Tweets found from username ${username}`);
    const stories = tweets.data.map((tweet: any) => ({
      headline: tweet.text,
      link: `https://x.com/i/status/${tweet.id}`,
      date_posted: startTime,
    }));
    combinedText.stories.push(...stories);
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      const response = error.response as { data?: unknown };
      console.error(`Twitter API error for ${username}:`, response.data);
      //   throw response.data;
      return;
    }
    // throw error;
    return;
  }
}

/**
 * @function processWebSource
 * @description Scrapes and processes content from non-Twitter web sources
 * @param {string} source - URL to scrape
 * @param {CombinedStories} combinedText - Collection to store processed stories
 */
async function processWebSource(source: string, combinedText: CombinedStories) {
  console.log('Web source', source);

  try {
    const scrapeResponse = await firecrawlClient.scrapeUrl(source, {
      formats: ['markdown'] as FirecrawlFormat[],
    });

    if (!scrapeResponse.success || !scrapeResponse.markdown) {
      throw new Error(
        `Failed to scrape: ${scrapeResponse.error || 'No markdown content'}`
      );
    }

    const markdown = scrapeResponse.markdown;

    try {
      console.log('Processing LLM filter for', source);
      const currentDate = dateUtils.getLocalDate();
      const LLMFilterResponse = await togetherClient.chat.completions.create({
        model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        messages: [
          {
            role: 'system',
            content: `Today is ${currentDate}. Return only today's AI or LLM related story or post headlines and links in JSON format from the scraped content. They must be posted today. The format should be {"stories": [{"headline": "headline1", "link": "link1", "date_posted": "date1"}, ...]}.
                     If there are no AI or LLM stories from today, return {"stories": []}. The source link is ${source}.
                     If the story or post link is not absolute, prepend ${source} to make it absolute.
                     Return only pure JSON in the specified format (no extra text, no markdown, no \`\`\`).
                     Scraped Content:\n\n${markdown}\n\nJSON:`,
          },
        ],
        response_format: {
          type: 'json_object',
          // @ts-ignore
          schema: jsonSchema,
        },
      });

      const rawJSON = LLMFilterResponse?.choices?.[0]?.message?.content;
      if (!rawJSON) {
        console.log(`ℹ️ No JSON output from LLM for ${source}`);
        return;
      }
      console.log('rawJSON', rawJSON);

      const todayStories = JSON.parse(rawJSON) as CombinedStories;
      console.log(
        `Found ${todayStories.stories.length} stories from ${source}`
      );
      combinedText.stories.push(...todayStories.stories);
    } catch (error) {
      console.error('Error processing LLM response:', error);
    }
  } catch (error) {
    console.error(`Scraping error for ${source}:`, error);
  }
}

/**
 * @function scrapeSources
 * @description Main function that orchestrates the scraping of all configured sources.
 * Handles both Twitter/X accounts and web pages, processes the content through
 * Together AI for relevance, and returns a unified list of stories.
 *
 * Pipeline:
 * 1. For Twitter sources:
 *    - Fetches recent tweets
 *    - Filters based on configured criteria
 *    - Converts tweets to story format
 *
 * 2. For web sources:
 *    - Scrapes content using Firecrawl
 *    - Processes through Together AI
 *    - Extracts relevant AI/LLM stories
 *
 * @param {string[]} sources - Array of source URLs to process
 * @returns {Promise<Story[]>} Array of processed stories from all sources
 *
 * @example
 * const sources = [
 *   'https://x.com/OpenAI',
 *   'https://www.firecrawl.dev/blog'
 * ];
 * const stories = await scrapeSources(sources);
 * Returns: [{ headline: "New AI Development", link: "...", date_posted: "..." }, ...]
 *
 * @throws {Error} Logs errors for individual source processing but continues with remaining sources
 */

export async function scrapeSources(sources: string[]): Promise<Story[]> {
  const sourcesLength = sources?.length || 0;
  console.log(`🔍 Scraping ${sourcesLength} sources for AI/LLM content...`);

  let combinedText: CombinedStories = { stories: [] };

  for (const source of sources) {
    const isTwitterSource = source.includes('x.com');

    if (isTwitterSource && sourceConfig.twitter.enabled) {
      await processTwitterSource(source, combinedText);
    } else if (sourceConfig.scraping.enabled) {
      await processWebSource(source, combinedText);
    }
  }

  return combinedText.stories;
}
