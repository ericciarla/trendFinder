import FirecrawlApp from '@mendable/firecrawl-js';
import Together from 'together-ai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

// 1. Define the schema for your expected JSON
const StorySchema = z.object({
  headline: z.string().describe("Story or post headline"),
  link: z.string().describe("A link to the post or story"),
  date_posted: z.string().describe("The date the story or post was published"),
});

const StoriesSchema = z.object({
  stories: z.array(StorySchema).describe(
    "A list of today's AI or LLM-related stories"
  ),
});

// 2. Convert Zod schema to JSON Schema for Together's response_format
const jsonSchema = zodToJsonSchema(StoriesSchema, {
  name: "StoriesSchema",
  nameStrategy: "title",
});

export async function scrapeSources(sources: string[]) {
  const num_sources = sources.length;
  console.log(`Scraping ${num_sources} sources...`);

  let combinedText: { stories: any[] } = { stories: [] };

  // Configure these if you want to toggle behavior
  const useTwitter = true;
  const useScrape = true;

  for (const source of sources) {
    // --- 1) Handle x.com (Twitter) sources ---
    if (source.includes("x.com")) {
      if (useTwitter) {
        const usernameMatch = source.match(/x\.com\/([^\/]+)/);
        if (usernameMatch) {
          const username = usernameMatch[1];

          // Build the search query for tweets
          const query = `from:${username} has:media -is:retweet -is:reply`;
          const encodedQuery = encodeURIComponent(query);

          // Get tweets from the last 24 hours
          const startTime = new Date(
            Date.now() - 24 * 60 * 60 * 1000
          ).toISOString();
          const encodedStartTime = encodeURIComponent(startTime);

          // x.com API URL
          const apiUrl = `https://api.x.com/2/tweets/search/recent?query=${encodedQuery}&max_results=10&start_time=${encodedStartTime}`;

          // Fetch recent tweets from the Twitter API
          const response = await fetch(apiUrl, {
            headers: {
              Authorization: `Bearer ${process.env.X_API_BEARER_TOKEN}`,
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch tweets for ${username}: ${response.statusText}`);
          }

          const tweets = await response.json();

          if (tweets.meta?.result_count === 0) {
            console.log(`No tweets found for username ${username}.`);
          } else if (Array.isArray(tweets.data)) {
            console.log(`Tweets found from username ${username}`);
            const stories = tweets.data.map((tweet: any) => {
              return {
                headline: tweet.text,
                link: `https://x.com/i/status/${tweet.id}`,
                date_posted: startTime,
              };
            });
            combinedText.stories.push(...stories);
          } else {
            console.error(
              "Expected tweets.data to be an array:",
              tweets.data
            );
          }
        }
      }
    }
    // --- 2) Handle all other sources (scraping) ---
    else {
      if (useScrape) {
        const scrapeResponse = await app.scrapeUrl(source, {
          formats: ["markdown"],
        });

        if (!scrapeResponse.success) {
          throw new Error(`Failed to scrape: ${scrapeResponse.error}`);
        }

        // Use Together with Llama 3.1 to extract only today's AI/LLM content
        try {
          const together = new Together();
          const currentDate = new Date().toLocaleDateString();

          const LLMFilterResponse = await together.chat.completions.create({
            model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
            messages: [
              {
                role: "system",
                content: `Today is ${currentDate}. Return only today's AI or LLM related story or post headlines and links in JSON format from the scraped content. They must be posted today. The format should be {"stories": [{"headline": "headline1", "link": "link1", "date_posted": "date1"}, ...]}.
If there are no AI or LLM stories from today, return {"stories": []}. The source link is ${source}.
If the story or post link is not absolute, prepend ${source} to make it absolute.
Return only pure JSON in the specified format (no extra text, no markdown, no \`\`\`).
Scraped Content:\n\n${scrapeResponse.markdown}\n\nJSON:`,
              },
            ],
            // 3. Enforce structured JSON output using our Zod-to-JSON-Schema
            //@ts-ignore
            response_format: { type: "json_object", schema: jsonSchema },
          });

          const rawJSON = LLMFilterResponse?.choices?.[0]?.message?.content;
          if (!rawJSON) {
            console.log(`No JSON output from LLM for ${source}`);
            continue;
          }

          // Parse the LLM's JSON response
          const todayStories = JSON.parse(rawJSON);
          console.log(`Found ${todayStories.stories.length} stories from ${source}`);
          combinedText.stories.push(...todayStories.stories);
        } catch (error) {
          console.error("Error processing LLM response:", error);
        }
      }
    }
  }

  // Return the combined stories from all sources
  const rawStories = combinedText.stories;
  return rawStories;
}
