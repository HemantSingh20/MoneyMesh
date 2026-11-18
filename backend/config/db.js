import mongoose from 'mongoose';

export let lastDbError = null;

const connectDB = async () => {
  try {
    const rawUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/moneymesh';
    const uri = rawUri.trim().replace(/^["']|["']$/g, '');

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    lastDbError = null;
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Self-heal: Drop stale unique index tripCode_1 if left over from previous schema versions
    try {
      const db = conn.connection.db;
      const tripsCollection = db.collection('trips');
      const indexes = await tripsCollection.indexes();
      if (indexes.some((idx) => idx.name === 'tripCode_1')) {
        await tripsCollection.dropIndex('tripCode_1');
        console.log('Successfully dropped stale index: tripCode_1');
      }
    } catch (indexError) {
      // Ignore if database/collection does not exist yet
    }
  } catch (error) {
    lastDbError = error.message;
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Do not call process.exit(1) on Render/production to prevent crash loops (503 hibernate-wake-error)
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
