import Together from 'together-ai';
import FirecrawlApp from '@mendable/firecrawl-js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const togetherClient = new Together();
export const firecrawlClient = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY! || '',
});

export const slackClient = axios.create({
  baseURL: process.env.SLACK_WEBHOOK_URL! || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const xClient = axios.create({
  baseURL: process.env.X_API_BEARER_TOKEN! || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * @constant {Object} dateUtils
 * @description Utility functions for date and time operations
 */
export const dateUtils = {
  getFormattedDate: () =>
    new Date().toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      month: 'numeric',
      day: 'numeric',
    }),

  getISOString: () => new Date().toISOString(),

  getLocalDate: () => new Date().toLocaleDateString(),

  get24HoursAgo: () => new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
};

/**
 * @constant {Object} sourceConfig
 * @description Configuration for scraping sources
 */
export const sourceConfig = {
  twitter: {
    enabled: true,
    maxResults: 10,
    filters: {
      hasMedia: true,
      excludeRetweets: true,
      excludeReplies: true,
    },
    buildQuery: (username: string) =>
      `from:${username} ${sourceConfig.twitter.filters.hasMedia ? 'has:media' : ''} ${sourceConfig.twitter.filters.excludeRetweets ? '-is:retweet' : ''} ${sourceConfig.twitter.filters.excludeReplies ? '-is:reply' : ''}`,
  },
  scraping: {
    enabled: true,
    formats: ['markdown'],
  },
};
