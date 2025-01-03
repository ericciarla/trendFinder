/**
 * @module services/sendDraft
 * @description Service responsible for sending generated AI/LLM trend summaries to Slack
 */

import { slackClient, dateUtils } from '../lib/clients';

/**
 * Sends a formatted draft post to Slack using configured webhook
 *
 * @function sendDraft
 * @description Posts AI/LLM trend summaries to a configured Slack channel using webhooks.
 * The function handles the HTTP request to Slack and provides feedback on the operation.
 *
 * @param {string} draft_post - Formatted text content to send to Slack
 * @returns {Promise<string>} Success or error message with timestamp
 *
 * @example
 * const message = await sendDraft('🚀 AI and LLM Trends on X for 1/3...');
 * Returns: "Success sending draft to Slack at 2024-01-03T12:00:00.000Z"
 *
 * @throws {Error} Logs error to console if Slack webhook request fails
 */

export async function sendDraft(draft_post: string): Promise<string> {
  try {
    const response = await slackClient.post('', { text: draft_post });
    return `Success sending draft to Slack at ${dateUtils.getISOString()}`;
  } catch (error) {
    console.log('error sending draft to Slack');
    console.log(error);
    return `Failed to send draft to Slack: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}
