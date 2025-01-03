/**
 * @module services/getCronSources
 * @description Retrieves a list of social media and blog sources to monitor for AI/LLM-related content.
 * The function maintains a curated list of influential tech accounts and relevant blog sources.
 */

interface Source {
  identifier: string;
}

export async function getCronSources(): Promise<string[]> {
  try {
    console.log('🔍 Fetching AI/LLM content sources...');

    // List of curated AI/LLM thought leaders, companies, and content sources
    const sources: Source[] = [
      // Official AI Companies
      { identifier: 'https://x.com/OpenAIDevs' },
      { identifier: 'https://x.com/OpenAI' },
      { identifier: 'https://x.com/AnthropicAI' },
      { identifier: 'https://x.com/AIatMeta' },
      { identifier: 'https://x.com/skirano' },
      { identifier: 'https://x.com/xai' },
      { identifier: 'https://x.com/alexalbert__' },
      { identifier: 'https://x.com/rauchg' },
      { identifier: 'https://x.com/amasad' },
      { identifier: 'https://x.com/leeerob' },
      { identifier: 'https://x.com/nutlope' },
      { identifier: 'https://x.com/akshay_pachaar' },
      { identifier: 'https://x.com/replit' },
      { identifier: 'https://x.com/firecrawl_dev' },
      { identifier: 'https://x.com/v0' },
      { identifier: 'https://x.com/aisdk' },
      { identifier: 'https://x.com/googleaidevs' },
      { identifier: 'https://x.com/nickscamara_' },
      { identifier: 'https://x.com/ericciarla' },
      { identifier: 'https://x.com/CalebPeffer' },
      // Additional AI Companies
      { identifier: 'https://x.com/MistralAI' },
      { identifier: 'https://x.com/Cohere' },
      // AI Researchers & Thought Leaders
      { identifier: 'https://x.com/karpathy' },
      { identifier: 'https://x.com/ylecun' },
      { identifier: 'https://x.com/sama' },
      { identifier: 'https://x.com/EMostaque' },
      { identifier: 'https://x.com/DrJimFan' },
      // AI Tools & Platforms
      { identifier: 'https://x.com/vercel' },
      { identifier: 'https://x.com/LangChainAI' },
      { identifier: 'https://x.com/llama_index' },
      { identifier: 'https://x.com/pinecone' },
      { identifier: 'https://x.com/modal_labs' },
      // AI News & Blogs
      { identifier: 'https://x.com/huggingface' },
      { identifier: 'https://x.com/weights_biases' },
      { identifier: 'https://x.com/replicate' },
      //   { identifier: 'https://www.firecrawl.dev/blog' },
    ];

    return sources.map((source) => source.identifier);
  } catch (error) {
    console.error('Error fetching AI/LLM content sources:', error);
    return [];
  }
}
