/**
 * @module index
 * @description Entry point for the AI/LLM trend collection application.
 * Initializes environment and schedules trend collection tasks.
 */

import { handleCron } from './controllers/cron';
import dotenv from 'dotenv';
import cron from 'node-cron';

// Load environment variables
dotenv.config();

/**
 * @constant CRON_SCHEDULE
 * @description Scheduled time for daily trend collection (5 PM UTC)
 */
const CRON_SCHEDULE = '0 17 * * *';

/**
 * @function main
 * @description Initializes and runs the trend collection pipeline
 * Executes the complete workflow for gathering and distributing AI/LLM trends
 *
 * @returns {Promise<void>} Resolves when initial pipeline execution completes
 * @throws {Error} Logs any errors during execution
 */

async function main(): Promise<void> {
  try {
    console.log('🚀 Initializing trend collection service...');
    await handleCron();
    console.log('Initial trend collection completed');

    // Schedule recurring trend collection
    cron.schedule(CRON_SCHEDULE, async () => {
      console.log('Starting scheduled trend collection...');
      try {
        await handleCron();
        console.log('Scheduled trend collection completed');
      } catch (error) {
        console.error('Error in scheduled trend collection:', error);
      }
    });

    console.log(`Scheduled next collection for ${CRON_SCHEDULE} UTC`);
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
}

// Start the application
main().catch((error) => console.error('Error:', error));
