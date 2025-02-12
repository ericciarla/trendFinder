import { scrapeSources } from "../services/scrapeSources";
import { getCronSources } from "../services/getCronSources";
import { generateDraft } from "../services/generateDraft";
import { sendDraft } from "../services/sendDraft";

export const handleCron = async (): Promise<void> => {
  try {
    const cronSources = await getCronSources();

    const rawStories = await scrapeSources(cronSources);
    const rawStoriesString = JSON.stringify(rawStories);
    const draftPost = await generateDraft(rawStoriesString);
    const result = await sendDraft(draftPost!);
    console.log(result);
  } catch (error) {
    console.error(error);
  }
};