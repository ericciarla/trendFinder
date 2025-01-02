
export async function getCronSources() {
  try {
    console.log("Fetching sources...");

    // Hardcoded list of sources
    const sources = [
      { identifier: "https://x.com/OpenAIDevs" },
      { identifier: "https://x.com/OpenAI" },
      { identifier: "https://x.com/AnthropicAI" },
      { identifier: "https://x.com/AIatMeta" },
      { identifier: "https://x.com/skirano" },
      { identifier: "https://x.com/xai" },
      { identifier: "https://x.com/alexalbert__"},
      { identifier: "https://x.com/rauchg"},
      { identifier: "https://x.com/amasad"},
      { identifier: "https://x.com/leeerob"},
      { identifier: "https://x.com/nutlope"},
      { identifier: "https://x.com/akshay_pachaar"},
      { identifier: "https://x.com/replit"},
      { identifier: "https://x.com/firecrawl_dev"},
      { identifier: "https://x.com/v0"},
      { identifier: "https://x.com/aisdk"},
      { identifier: "https://x.com/googleaidevs"},
      { identifier: "https://x.com/nickscamara_"},
      { identifier: "https://x.com/ericciarla"},
      { identifier: "https://x.com/CalebPeffer"},
      { identifier: "https://www.firecrawl.dev/blog"},

    ];

    return sources.map(source => source.identifier);
  } catch (error) {
    console.error(error);
  }
}
