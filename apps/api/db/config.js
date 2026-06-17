require('colors');
const { mongoose } = require('mongoose');
const logger = require('../services/logger');
require('dotenv').config();

const connectDB = async () => {
  let db;
  try {
    const uri = process.env.MONGODB_URI
      || process.env.MONGO_URI
      || process.env.MONGO_URL;
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
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
  } catch (error) {
    logger.error('Error connecting to MongoDB: ', error.message);
    if (db) {
      db.on('error', (err) => {
        logger.error(`MongoDB connection error: ${err}`);
      });
    }
    process.exit(1); // 1 indicates failure,  0 status code is success
  }
};

module.exports = connectDB;
