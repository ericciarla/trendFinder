/**
 * @module controllers/cron
 * @description Controller responsible for orchestrating the trend collection pipeline.
 * Manages the complete workflow from source fetching to Slack notification.
 */

import { scrapeSources } from '../services/scrapeSources';
import { getCronSources } from '../services/getCronSources';
import { generateDraft } from '../services/generateDraft';
import { sendDraft } from '../services/sendDraft';

/**
 * @function handleCron
 * @description Orchestrates the complete workflow for trend collection and notification:
 * 1. Fetches configured source accounts and blogs
 * 2. Scrapes content from these sources
 * 3. Generates a curated draft of trending topics
 * 4. Sends the draft to configured Slack channel
 *
 * The function runs through the following pipeline:
 * Sources → Scraping → Analysis → Draft Generation → Slack Notification
 *
 * @throws {Error} Logs any errors that occur during the pipeline execution
 * @returns {Promise<void>} Resolves when the complete pipeline has finished
 * @since 1.0.0
 */

export const handleCron = async (): Promise<void> => {
  try {
    // 1. Fetch configured source accounts and blogs
    const cronSources = await getCronSources();
    if (!cronSources?.length) {
      throw new Error('No sources found to process');
    }

    // 2. Scrape content from all sources
    const rawStories = await scrapeSources(cronSources!);
    if (rawStories.length === 0) {
      throw new Error('No stories found to process');
    }

    const rawStoriesString = JSON.stringify(rawStories);

    // 3. Generate curated draft of trends
    const draftPost = await generateDraft(rawStoriesString);

    console.log('draftPost', draftPost);

    if (!draftPost.success) {
      throw new Error('Failed to generate draft post');
    }

    // 4. Send to Slack
    const result = await sendDraft(draftPost.data);
    console.log(result);
  } catch (error) {
    console.error('Error in cron pipeline:', error);
  }
};
