import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import router from './routes/user/routes';
import { mongodbConnect, gracefulShutdown } from './config/db';

// dotenvを初期化して環境変数をロード
dotenv.config();

// Expressアプリケーションの初期化
const server = express();
server.use(cors());
server.use('/', router);
server.use(express.json());
server.options('/article/post', cors());
server.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

const EXPRESS_PORT = process.env.EXPRESS_PORT || 3002;

// MongoDB接続とサーバー起動を統合
async function main() {
  try {
    await mongodbConnect();
    server.listen(EXPRESS_PORT, () => {
      console.log(`Server running on port ${EXPRESS_PORT}`);
    });
  } catch (error: unknown) {
    await gracefulShutdown('SIGINT');
    if (error instanceof Error) {
      console.error('Error connecting to MongoDB:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
  }
}

// アプリケーションを起動
main().catch(console.error);
