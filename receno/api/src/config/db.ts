import { MongoClient } from 'mongodb';
export const DATABASE_NAME = process.env.DATABASE_NAME || 'myDatabase';
const MONGO_URI =
  process.env.MONGO_URI || `mongodb://username:password@mongo:27017/admin`;
export const client = new MongoClient(MONGO_URI);

export async function mongodbConnect(): Promise<void> {
  try {
    const mongoDB = await client.connect();
    if (mongoDB) {
      console.log('MongoDB is connected');
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error connecting to MongoDB:', error.message);
    } else {
      console.error('Error connecting to MongoDB:', error);
    }
  }
}

// クリーンアップ処理
export const gracefulShutdown = async (signal: string) => {
  console.log(`${signal} received: Closing MongoDB connection...`);
  try {
    await client.close();
    console.log('MongoDB connection closed.');
    process.exit(0); // 正常終了
  } catch (error) {
    console.error('Error while closing MongoDB connection:', error);
    process.exit(1); // 異常終了
  }
};

// SIGINT (Ctrl + C) と SIGTERM (サーバーストップ) に対応
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
