const { App, ExpressReceiver } = require('@slack/bolt');
const express = require('express');

// Slack app setup
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver,
});

// Simple "hello" handler
app.message('hello', async ({ message, say }) => {
  await say(`Hello, <@${message.user}>!`);
});

// Export handler for Netlify
const expressApp = express();
expressApp.use('/slack/events', receiver.app);

exports.handler = require('@netlify/functions').serverlessHttp(expressApp);
