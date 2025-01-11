
import dotenv from 'dotenv';

dotenv.config();

export async function getCronSources() {
  try {
    console.log("Fetching sources...");

    // Check for required API keys
    const hasXApiKey = !!process.env.X_API_BEARER_TOKEN || !!process.env.SOCIALDATA_API_KEY;
    const hasFirecrawlKey = !!process.env.FIRECRAWL_API_KEY;

    // Filter sources based on available API keys
    const sources = [
      // High priority sources (Only 1 x account due to free plan rate limits)
      ...(hasFirecrawlKey ? [
        { identifier: 'https://www.firecrawl.dev/blog' },
        { identifier: 'https://openai.com/news/' },
        { identifier: 'https://www.anthropic.com/news' },
        { identifier: 'https://news.ycombinator.com/' },
        { identifier: 'https://www.reuters.com/technology/artificial-intelligence/' },
        { identifier: 'https://simonwillison.net/' },
        { identifier: 'https://buttondown.com/ainews/archive/' },
      ] : []),
      ...(hasXApiKey ? [
        { identifier: 'https://x.com/skirano' },
      // Official AI Companies
      // { identifier: 'https://x.com/OpenAIDevs' },
      // { identifier: 'https://x.com/xai' },
      // { identifier: 'https://x.com/alexalbert__' },
      // { identifier: 'https://x.com/leeerob' },
      // { identifier: 'https://x.com/v0' },
      // { identifier: 'https://x.com/aisdk' },
      // { identifier: 'https://x.com/firecrawl_dev' },
      // { identifier: 'https://x.com/AIatMeta' },
      // { identifier: 'https://x.com/googleaidevs' },

      // Additional AI Companies
      // { identifier: 'https://x.com/MistralAI' },
      // { identifier: 'https://x.com/Cohere' },

      // AI Researchers & Thought Leaders
      // { identifier: 'https://x.com/karpathy' },
      // { identifier: 'https://x.com/ylecun' },
      // { identifier: 'https://x.com/sama' },
      // { identifier: 'https://x.com/EMostaque' },
      // { identifier: 'https://x.com/DrJimFan' },
      // { identifier: 'https://x.com/nickscamara_' },
      // { identifier: 'https://x.com/CalebPeffer' },
      // { identifier: 'https://x.com/akshay_pachaar' },
      // { identifier: 'https://x.com/ericciarla' },
      // { identifier: 'https://x.com/amasad' },
      // { identifier: 'https://x.com/nutlope' },
      // { identifier: 'https://x.com/rauchg' },

      // AI Tools & Platforms
      // { identifier: 'https://x.com/vercel' },
      // { identifier: 'https://x.com/LangChainAI' },
      // { identifier: 'https://x.com/llama_index' },
      // { identifier: 'https://x.com/pinecone' },
      // { identifier: 'https://x.com/modal_labs' },
      
      // AI News & Blogs
      // { identifier: 'https://x.com/huggingface' },
      // { identifier: 'https://x.com/weights_biases' },
      // { identifier: 'https://x.com/replicate' },
      ] : []),
      
      
    ];

    return sources.map(source => source.identifier);
  } catch (error) {
    console.error(error);
  }
} 