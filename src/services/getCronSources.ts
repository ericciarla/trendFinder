import prisma from '../lib/prisma'

export async function getCronSources() {
  try {
    console.log("Fetching sources...");

    // Get API keys from database
    const apiKeys = await prisma.apiKeys.findMany()
    const hasXApiKey = apiKeys.some(key => key.service === 'x')
    const hasFirecrawlKey = apiKeys.some(key => key.service === 'firecrawl')

    // Get X accounts from database
    const xAccounts = await prisma.xAccount.findMany()
    
    const sources = [
      // Firecrawl sources
      ...(hasFirecrawlKey ? [
        { identifier: 'https://www.firecrawl.dev/blog' },
        { identifier: 'https://openai.com/news/' },
        { identifier: 'https://www.anthropic.com/news' },
        { identifier: 'https://news.ycombinator.com/' },
        { identifier: 'https://www.reuters.com/technology/artificial-intelligence/' },
        { identifier: 'https://simonwillison.net/' },
        { identifier: 'https://buttondown.com/ainews/archive/' },
      ] : []),

      // X/Twitter sources
      ...(hasXApiKey ? xAccounts.map(account => ({
        identifier: `https://x.com/${account.username}`
      })) : []),
    ];

    return sources.map(source => source.identifier);
  } catch (error) {
    console.error(error);
  }
} 