import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
// import OpenAI from "openai";

dotenv.config();

/**
 * Generate a post draft with trending ideas based on raw tweets.
 */
export async function generateDraft(rawStories: string) {
  console.log(`Generating a post draft with raw stories (${rawStories.length} characters)...`);

  try {
    // Get current date for header
    const currentDate = new Date().toLocaleDateString("en-US", {
      timeZone: "America/New_York",
      month: "numeric",
      day: "numeric",
    });

    // Define prompt
    const prompt = `
      You are given a list of raw AI and LLM-related tweets sourced from X/Twitter.
      Your task is to find interesting trends, launches, or unique insights from the tweets.
      For each tweet, provide a 'story_or_tweet_link' and a one-sentence 'description'.
      Return at least 10 tweets unless fewer are available.
      
      Format the output strictly as JSON:
      {
        "interestingTweetsOrStories": [
          {
            "story_or_tweet_link": "https://x.com/...",
            "description": "..."
          }
        ]
      }

      Here are the raw tweets:
      ${rawStories}
    `;
//o3-mini implementation

// const completion = await openai.chat.completions.create({
//   model: "o3-mini",
//   reasoning_effort: "medium",
//   messages: [{ role: "user", content: prompt }],
//   store: true,
// });

    // Initialize Gemini client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Call Gemini API
    const result = await model.generateContent(prompt);
    const rawJSON = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

    if (!rawJSON) {
      console.log("No JSON output returned.");
      return "No output.";
    }

    console.log(rawJSON);
    const parsedResponse = JSON.parse(rawJSON);

    // Construct the final post
    const header = `🚀 AI and LLM Trends on X for ${currentDate}\n\n`;
    const draft_post = header + parsedResponse.interestingTweetsOrStories
      .map((tweetOrStory: any) => `• ${tweetOrStory.description}\n  ${tweetOrStory.story_or_tweet_link}`)
      .join("\n\n");

    return draft_post;

  } catch (error) {
    console.error("Error generating draft post", error);
    return "Error generating draft post.";
  }
}