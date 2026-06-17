import { MailtrapClient } from 'mailtrap';
import dotenv from 'dotenv';

dotenv.config();

const mailtrapClient = new MailtrapClient({
  endpoint: process.env.MAILTRAP_ENDPOINT,
  token: process.env.MAILTRAP_TOKEN!,
} as ConstructorParameters<typeof MailtrapClient>[0]);

const sender = {
  email: process.env.MAILTRAP_SENDING_MAIL ?? '',
  name: process.env.MAILTRAP_SENDER ?? '',
};

export { mailtrapClient, sender };
