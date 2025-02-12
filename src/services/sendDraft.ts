import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export async function sendDraft(draft_post: string) {
  try {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error("SLACK_WEBHOOK_URL is not defined.");
    }

    const response = await axios.post(
      webhookUrl,
      {
        text: draft_post,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return `Success sending draft to webhook at ${new Date().toISOString()}`;
  } catch (error) {
    console.log('error sending draft to webhook');
    console.log(error);
  }
}