/**
 * @module services/generateDraft
 * @description Service responsible for generating a curated draft post from raw stories
 */

import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { dateUtils, togetherClient } from '../lib/clients';

/**
 * @function generateDraft
 * @description Processes raw stories and generates a curated draft post using Together AI's LLM.
 * The function performs the following:
 * 1. Processes raw story data through Llama 3.1 model
 * 2. Extracts key trends and interesting developments
 * 3. Formats content into a structured Slack message
 *
 * @param {string} rawStories - JSON string containing raw stories from various sources
 * @returns {Promise<{ success: boolean; data: string }>} Formatted draft post ready for Slack
 * @throws {Error} Logs errors during draft generation process
 *
 * @example
 * const draft = await generateDraft(rawStoriesJson);
 * Returns:
 * 🚀 AI and LLM Trends on X for 1/3
 * • Latest development in AI research by OpenAI
 */

export async function generateDraft(
  rawStories: string
): Promise<{ success: boolean; data: string }> {
  console.log(
    `Generating draft post from ${rawStories.length} characters of content...`
  );

  if (rawStories.length === 0) {
    return { success: false, data: 'No stories found to process' };
  }

  try {
    // Define the schema for our response
    const DraftPostSchema = z
      .object({
        interestingTweets: z.array(
          z.object({
            tweet_link: z.string().describe('The direct link to the tweet'),
            description: z
              .string()
              .describe(
                "A short sentence describing what's interesting about the tweet"
              ),
          })
        ),
      })
      .describe('Draft post schema with interesting tweets for AI developers.');

    // Convert our Zod schema to JSON Schema
    const jsonSchema = zodToJsonSchema(DraftPostSchema, {
      name: 'DraftPostSchema',
      nameStrategy: 'title',
    });

    // Create a date string if you need it in the post header
    const currentDate = dateUtils.getFormattedDate();

    // Use Together’s chat completion with the Llama 3.1 model
    const completion = await togetherClient.chat.completions.create({
      model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      messages: [
        {
          role: 'system',
          content: `You are given a list of raw AI and LLM-related tweets sourced from X/Twitter.
                   Only respond in valid JSON that matches the provided schema (no extra keys).
          `,
        },
        {
          role: 'user',
          content: `Your task is to find interesting trends, launches, or interesting examples from the tweets.
                   For each tweet, provide a 'tweet_link' and a one-sentence 'description'.
                   Return all relevant tweets as separate objects.
                   Aim to pick at least 10 tweets unless there are fewer than 10 available.
                   If there are less than 10 tweets, return ALL of them.
                   Here are the raw tweets you can pick from:\n\n${rawStories}\n\n`,
        },
      ],

      // Tell Together to strictly enforce JSON output that matches our schema
      // @ts-ignore
      response_format: { type: 'json_object', schema: jsonSchema },
    });

    // Check if we got a content payload in the first choice
    const modelResponse = completion?.choices?.[0]?.message?.content;
    if (!modelResponse) {
      console.log('No JSON output returned from Together.');
      return { success: false, data: 'No output.' };
    }
    console.log('modelResponse', modelResponse);

    // Parse the JSON to match our schema
    const parsedTweets = JSON.parse(modelResponse);

    // Construct the final post
    const postHeader = `🚀 AI and LLM Trends on X for ${currentDate}\n\n`;
    const formattedPost =
      postHeader +
      parsedTweets.interestingTweets
        .map((tweet: any) => `• ${tweet.description}\n  ${tweet.tweet_link}`)
        .join('\n\n');

    return { success: true, data: formattedPost };
  } catch (error) {
    console.error('Error generating draft post', error);
    return { success: false, data: 'Error generating draft post.' };
  }
}
