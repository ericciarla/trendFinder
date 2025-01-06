import axios from 'axios';
import prisma from '../lib/prisma'

export async function sendDraft(draft_post: string) {
  try {
    // Get Slack webhook URL from database
    const slackKey = await prisma.apiKeys.findFirst({
      where: { service: 'slack' }
    })

    if (!slackKey?.key) {
      throw new Error('Slack webhook URL not configured')
    }

    const response = await axios.post(
      slackKey.key,
      { text: draft_post },
      { headers: { 'Content-Type': 'application/json' } }
    );

    return `Success sending draft to webhook at ${new Date().toISOString()}`;
  } catch (error) {
    console.log('error sending draft to webhook');
    console.log(error);
  }
}