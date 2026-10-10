
import mongoose from 'mongoose';

let memoryServer = null;

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    const isTest = process.env.NODE_ENV === 'test';
    const isPlaceholderUri =
      !mongoUri ||
      mongoUri.includes('<username>') ||
      mongoUri.includes('<password>');

    // Import the in-memory database only when testing or explicitly enabled.
    if (isTest || isPlaceholderUri || process.env.USE_MEMORY_DB === 'true') {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          'MONGO_URI must be configured for production. Do not use an in-memory database.'
        );
      }

      console.log('Starting in-memory MongoDB for testing...');

      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      mongoUri = memoryServer.getUri();
    }

    if (!mongoUri) {
      throw new Error('MONGO_URI is missing from environment variables');
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: true
    });

    console.log(
      `MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`
    );

    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);

    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }

    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();

    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
  } catch (error) {
    console.error('Error disconnecting MongoDB:', error);
  }
};
