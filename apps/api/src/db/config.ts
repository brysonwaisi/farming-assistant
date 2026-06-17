import 'colors';
import mongoose, { Connection } from 'mongoose';
import logger from '../services/logger';
import 'dotenv/config';

const connectDB = async (): Promise<void> => {
  let db: Connection | undefined;
  try {
    const uri = process.env.MONGODB_URI
      || process.env.MONGO_URI
      || process.env.MONGO_URL;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined');
    }
    const conn = await mongoose.connect(uri, {
      dbName: process.env.DB_NAME,
      serverSelectionTimeoutMS: 8000,
    });
    logger.info(
      `MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold,
    );

    db = mongoose.connection;

    db.once('open', () => {
      logger.info('MongoDB connected successfully');
    });
    db.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
  } catch (error: unknown) {
    logger.error(
      'Error connecting to MongoDB: ',
      error instanceof Error ? error.message : String(error),
    );
    if (db) {
      db.on('error', (err: unknown) => {
        logger.error(`MongoDB connection error: ${err}`);
      });
    }
    process.exit(1); // 1 indicates failure,  0 status code is success
  }
};

export default connectDB;
