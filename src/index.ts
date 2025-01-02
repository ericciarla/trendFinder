import 'dotenv/config'
import { handleCron } from "./controllers/cron"
import cron from 'node-cron';

async function main() {
  console.log(`Starting process to generate draft...`);
  await handleCron();
}
main();


// If you want to run the cron job manually, uncomment the following line:
//cron.schedule(`0 17 * * *`, async () => {
//  console.log(`Starting process to generate draft...`);
//  await handleCron();
//});
