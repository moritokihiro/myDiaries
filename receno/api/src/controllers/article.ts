import { Request, Response } from 'express';
import {
  createArticle,
  getArticleData,
  getArticleDetailData,
  getHashtagData,
} from '../repositories/article';

export async function postArticle(req: Request, res: Response): Promise<void> {
  try {
    const { hashtag, title, description, date, writer } = req.body;
    const image = req.file?.path;

    // hashtagを配列に変換
    const hashtagsArray = hashtag
      ? hashtag
          .split('#')
          .map((tag: string) => tag.trim()) // `#`を削除してトリム
          .filter((tag: string) => tag !== '') // 空文字を除外
      : [];

    const data = {
      title,
      description,
      hashtags: hashtagsArray,
      date,
      writer,
      image_url: image,
      visit_count: 0,
    };
    await createArticle(data); // Insert data into the database
    res.status(200).json({ message: 'Data inserted successfully' });
  } catch (error: unknown) {
    res
      .status(500)
      .json({ message: 'Error inserting data', error: (error as Error).message });
  }
}

export async function getAllArticles(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const sortField = req.query.sortField as string;
    const sortOrder = req.query.sortOrder as 'asc' | 'desc';
    console.log(sortField, sortOrder);
    const articleData = await getArticleData(sortField, sortOrder);
    console.log(articleData);
    res
      .status(200)
      .json({ message: 'Data read successfully', articleData: articleData });
  } catch (error: unknown) {
    res
      .status(500)
      .json({ message: 'Error reading data', error: (error as Error).message });
  }
}

export async function getArticleDetail(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = req.params.id;
    const detail = await getArticleDetailData(id);
    res.status(200).json({ message: 'Data read successfully', detail: detail });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error reading data', error: error.message });
  }
}

export async function getHashtag(req: Request, res: Response): Promise<void> {
  try {
    const keyword = decodeURIComponent(req.params.hashtag); // Decode the hashtag
    console.log('ハッシュタグ検索:', keyword);
    const hashtagData = await getHashtagData(keyword);
    console.log(hashtagData);
    res
      .status(200)
      .json({ message: 'Data read successfully', hashtagData: hashtagData });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error reading data', error: error.message });
  }
}
