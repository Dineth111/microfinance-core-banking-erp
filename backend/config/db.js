import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/microfinance';
  const localUri = 'mongodb://127.0.0.1:27017/microfinance';

  try {
    const db = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB Connected]: ${db.connection.host}`);
    return;
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);

    // If primary connection failed and it's not already pointing to local, attempt local fallback
    if (primaryUri !== localUri) {
      console.log('🔄 Attempting fallback connection to local MongoDB (127.0.0.1:27017)...');
      try {
        const localDb = await mongoose.connect(localUri, {
          serverSelectionTimeoutMS: 3000,
        });
        isConnected = true;
        console.log(`[MongoDB Connected]: Connected to local MongoDB (${localDb.connection.host})`);
        return;
      } catch (localErr) {
        console.error('Local MongoDB fallback also failed:', localErr.message);
      }
    }

    if (process.env.NODE_ENV === 'test') {
      console.log('[Test Mode]: Proceeding with mock/local handling...');
      isConnected = false;
    } else {
      const enhancedError = new Error(
        `Database connection failed (${error.message}). Please verify MONGO_URI in backend/.env or ensure MongoDB is running.`
      );
      enhancedError.status = 500;
      throw enhancedError;
    }
  }
};

export default connectDB;
