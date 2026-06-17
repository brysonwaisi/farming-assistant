const { MailtrapClient } = require('mailtrap');
const dotenv = require('dotenv');

dotenv.config();

const mailtrapClient = new MailtrapClient({
  endpoint: process.env.MAILTRAP_ENDPOINT,
  token: process.env.MAILTRAP_TOKEN,
});

const sender = {
  email: process.env.MAILTRAP_SENDING_MAIL,
  name: process.env.MAILTRAP_SENDER,
};

module.exports = { mailtrapClient, sender };
