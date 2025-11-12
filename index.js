const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

app.event('app_home_opened', async ({ say }) => {
  await say('Hello from Curated Caps Advisory!');
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('\u26a1\ufe0f Bolt app is running!');
})();
