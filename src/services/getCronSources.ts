import dotenv from "dotenv";

dotenv.config();

export async function getCronSources(): Promise<{ identifier: string }[]> {
  try {
    console.log("Fetching sources...");

    // Check for required API keys
    const hasXApiKey = !!process.env.X_API_BEARER_TOKEN;
    const hasFirecrawlKey = !!process.env.FIRECRAWL_API_KEY;

    // Define sources based on available API keys
    const sources: { identifier: string }[] = [
      ...(hasFirecrawlKey
        ? [
            {
              identifier:
                "https://news.ycombinator.com/",
            },
            // { identifier: "https://simonwillison.net/" },
          ]
        : []),
      // ...(hasXApiKey ? [{ identifier: "https://x.com/v0" }] : []),
    ];

    // Return the full objects instead of mapping to strings
    return sources;
  } catch (error) {
    console.error(error);
    return [];
  }
}
