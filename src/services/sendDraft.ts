import axios from 'axios';

export async function sendDraft(draft_post: string) {
  try {
    const response = await axios.post(
      process.env.SLACK_WEBHOOK_URL || '',
      {
        text: draft_post,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return `Success sending draft to Slack at ${new Date().toISOString()}`;
  } catch (error) {
    console.log('error sending draft to Slack');
    console.log(error);
  }
}
