import { Db, Collection, SortDirection, ObjectId } from 'mongodb';
import { client, DATABASE_NAME } from '../config/db';
import dotenv from 'dotenv';
dotenv.config();

const collectionName: string =
  process.env.ARTICLE_COLLECTION_NAME || 'articles';
const db: Db = client.db(DATABASE_NAME);
const collection: Collection = db.collection(collectionName);

// 記事作成
export async function createArticle(data: Record<string, any>): Promise<void> {
  try {
    const result = await collection.insertOne(data);
    console.log('Inserted ID:', result.insertedId);
  } catch (error: any) {
    console.error('Error inserting data:', error.message);
  }
}

// 記事取得
export async function getArticleData(
  sortField: string,
  sortOrder: 'asc' | 'desc'
): Promise<any[]> {
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

// 記事詳細取得
export async function getArticleDetailData(id: string): Promise<any> {
  const objectId = new ObjectId(id); // 文字列からObjectIdに変換
  const collection: Collection = db.collection(collectionName);
  const detail = await collection.findOne({ _id: new ObjectId(objectId) });
  await collection.findOneAndUpdate(
    { _id: new ObjectId(objectId) }, // 条件: _idが一致
    { $inc: { visit_count: 1 } }, // visit_countを+1
    { returnDocument: 'after' } // 更新後のドキュメントを返す
  );
  return detail;
}

// ハッシュタグ検索
export async function getHashtagData(keyword: string): Promise<any[]> {
  const hashtagData = await collection
    .find({ hashtags: { $in: [keyword] } })
    .toArray();
  return hashtagData;
}
