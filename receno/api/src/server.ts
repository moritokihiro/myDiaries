import express, { Request, Response } from 'express';
import { MongoClient, Db, Collection, ObjectId, SortDirection } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import upload from './upload';

// dotenvを初期化して環境変数をロード
dotenv.config();

// Expressアプリケーションの初期化
const server = express();
server.use(express.json());
server.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
server.use(cors());
server.options('/article/post', cors());

// 環境変数から設定を取得
const EXPRESS_PORT = process.env.EXPRESS_PORT || 3002;
const MONGO_URI =
  process.env.MONGO_URI || `mongodb://username:password@mongo:27017/admin`;
const DATABASE_NAME = process.env.DATABASE_NAME || 'myDatabase';
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'users';
const client = new MongoClient(MONGO_URI);

// 記事作成
async function createArticle(
  db: Db,
  collectionName: string,
  data: Record<string, any>
): Promise<void> {
  try {
    const collection: Collection = db.collection(collectionName);
    const result = await collection.insertOne(data);
    console.log('Inserted ID:', result.insertedId);
  } catch (error: any) {
    console.error('Error inserting data:', error.message);
  }
}

// 記事取得
async function getArticle(
  db: Db,
  collectionName: string,
  sortField: string,
  sortOrder: 'asc' | 'desc'
): Promise<any[]> {
  const collection: Collection = db.collection(collectionName);
  const order: SortDirection = sortOrder === 'asc' ? 1 : -1; // ソートオーダーを数値に変換（asc -> 1, desc -> -1）
  const sortCriteria: Record<string, SortDirection> = {};
  if (['visit_count', 'date'].includes(sortField)) {
    sortCriteria[sortField] = order;
  } else {
    throw new Error(
      "Invalid sort field. Allowed fields: 'visit_count', 'date'."
    );
  }
  return await collection.find({}).sort(sortCriteria).toArray();
}

server.get('/', (req: Request, res: Response) => {
  res.send('Hello World');
});

server.post(
  '/article/post',
  upload.single('image'),
  async (req: Request, res: Response) => {
    const { hashtag, title, description, date, writer } = req.body;
    const image = req.file?.path;

    // hashtagを配列に変換
    const hashtagsArray = hashtag
      ? hashtag
          .split('#')
          .map((tag: string) => tag.trim()) // `#`を削除してトリム
          .filter((tag: string) => tag !== '') // 空文字を除外
      : [];

    try {
      const db: Db = client.db(DATABASE_NAME);
      const data = {
        title,
        description,
        hashtags: hashtagsArray,
        date,
        writer,
        image_url: image,
        visit_count: 0,
      };
      await createArticle(db, COLLECTION_NAME, data); // Insert data into the database
      res.status(200).json({ message: 'Data inserted successfully' });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: 'Error inserting data', error: error.message });
    }
  }
);

server.get('/articles', async (req: Request, res: Response) => {
  try {
    const sortField = req.query.sortField as string;
    const sortOrder = req.query.sortOrder as 'asc' | 'desc';
    console.log(sortField, sortOrder);
    const db: Db = client.db(DATABASE_NAME);
    const articleData = await getArticle(
      db,
      COLLECTION_NAME,
      sortField,
      sortOrder
    );
    console.log(articleData);
    res
      .status(200)
      .json({ message: 'Data read successfully', articleData: articleData });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error reading data', error: error.message });
  }
});

server.get('/:id/detail', async (req: Request, res: Response) => {
  try {
    const db: Db = client.db(DATABASE_NAME);
    const collection: Collection = db.collection(COLLECTION_NAME);
    const objectId = new ObjectId(req.params.id); // Convert the string ID to an ObjectId
    console.log(objectId);
    const detail = await collection.findOne({ _id: objectId });

    await collection.findOneAndUpdate(
      { _id: new ObjectId(objectId) }, // 条件: _idが一致
      { $inc: { visit_count: 1 } }, // visit_countを+1
      { returnDocument: 'after' } // 更新後のドキュメントを返す
    );

    res.status(200).json({ message: 'Data read successfully', detail: detail });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error reading data', error: error.message });
  }
});

server.get('/keyword/:hashtag', async (req: Request, res: Response) => {
  try {
    console.log(req.params);
    const db: Db = client.db(DATABASE_NAME);
    const collection: Collection = db.collection(COLLECTION_NAME);
    const keyword = decodeURIComponent(req.params.hashtag); // Decode the hashtag
    console.log('ハッシュタグ検索:', keyword);
    const hashtagData = await collection
      .find({ hashtags: { $in: [keyword] } })
      .toArray();
    console.log(hashtagData);
    res
      .status(200)
      .json({ message: 'Data read successfully', hashtagData: hashtagData });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error reading data', error: error.message });
  }
});

// MongoDB接続とサーバー起動を統合
async function main() {
  try {
    // MongoDBに接続
    const mongoDB = await client.connect();
    if (mongoDB) {
      console.log('MongoDB is connected');
    }

    // サーバーの起動
    server.listen(EXPRESS_PORT, () => {
      console.log(`Server running on port ${EXPRESS_PORT}`);
    });

    // アプリケーションのクリーンアップ
    process.on('SIGINT', async () => {
      console.log('Closing MongoDB connection...');
      await client.close();
      process.exit();
    });
  } catch (error: any) {
    console.error('Error connecting to MongoDB:', error.message);
  }
}

// アプリケーションを起動
main().catch(console.error);
