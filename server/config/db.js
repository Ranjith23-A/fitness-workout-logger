import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer = null;

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    // Check if we should use in-memory DB (for testing or when MONGO_URI is missing/placeholder)
    const isTest = process.env.NODE_ENV === 'test';
    const isPlaceholderUri = !mongoUri || mongoUri.includes('<username>') || mongoUri.includes('<password>');

    if (isTest || isPlaceholderUri || process.env.USE_MEMORY_DB === 'true') {
      console.log('Using in-memory MongoDB instance for fast, zero-dependency execution...');
      memoryServer = await MongoMemoryServer.create();
      mongoUri = memoryServer.getUri();
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    console.log(`MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // If not in test mode, exit process
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (memoryServer) {
      await memoryServer.stop();
    }
  } catch (error) {
    console.error('Error disconnecting MongoDB:', error);
  }
};
