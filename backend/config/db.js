import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/moneymesh');
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
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
