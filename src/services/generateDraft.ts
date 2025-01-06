import dotenv from 'dotenv';
import Together from 'together-ai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import prisma from '../lib/prisma'

dotenv.config();

/**
 * Generate a post draft with trending ideas based on raw tweets.
 */
export async function generateDraft(rawStories: string) {
  console.log(`Generating a post draft with raw stories (${rawStories.length} characters)...`)

  try {
    // Get Together AI key from database
    const togetherKey = await prisma.apiKeys.findFirst({
      where: { service: 'together' }
    })

    if (!togetherKey?.key) {
      throw new Error('Together AI key not configured')
    }

    // Initialize Together with key from database
    const together = new Together({ apiKey: togetherKey.key });

    // Define the schema for our response
    const DraftPostSchema = z.object({
      interestingTweetsOrStories: z.array(z.object({
        story_or_tweet_link: z.string().describe("The direct link to the tweet or story"),
        description: z.string().describe("A short sentence describing what's interesting about the tweet or story")
      }))
    }).describe("Draft post schema with interesting tweets or stories for AI developers.");

    // Convert our Zod schema to JSON Schema
    const jsonSchema = zodToJsonSchema(DraftPostSchema, {
      name: 'DraftPostSchema',
      nameStrategy: 'title'
    });

    // Create a date string if you need it in the post header
    const currentDate = new Date().toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      month: 'numeric',
      day: 'numeric',
    });

    // Use Together’s chat completion with the Llama 3.1 model
    const completion = await together.chat.completions.create({
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
          content: `Your task is to find interesting trends, launches, or interesting examples from the tweets or stories. 
For each tweet or story, provide a 'story_or_tweet_link' and a one-sentence 'description'. 
Return all relevant tweets or stories as separate objects. 
Aim to pick at least 10 tweets or stories unless there are fewer than 10 available. If there are less than 10 tweets or stories, return ALL of them. Here are the raw tweets or stories you can pick from:\n\n${rawStories}\n\n`
        },
      ],
      // Tell Together to strictly enforce JSON output that matches our schema
      // @ts-ignore
      response_format: { type: 'json_object', schema: jsonSchema },
    });

    // Check if we got a content payload in the first choice
    const rawJSON = completion?.choices?.[0]?.message?.content;
    if (!rawJSON) {
      console.log("No JSON output returned from Together.");
      return "No output.";
    }
    console.log(rawJSON);

    // Parse the JSON to match our schema
    const parsedResponse = JSON.parse(rawJSON);

    // Construct the final post
    const header = `🚀 AI and LLM Trends on X for ${currentDate}\n\n`;
    const draft_post = header + parsedResponse.interestingTweetsOrStories
      .map((tweetOrStory: any) => `• ${tweetOrStory.description}\n  ${tweetOrStory.story_or_tweet_link}`)
      .join('\n\n');

    return draft_post;

  } catch (error) {
    console.error("Error generating draft post", error);
    return "Error generating draft post.";
  }
}
