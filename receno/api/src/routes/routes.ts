import { helloWorld } from '../controllers/helloWorld';
import {
  postArticle,
  getAllArticles,
  getArticleDetail,
  getHashtag,
} from '../controllers/article';

const router = require('express').Router();

router.get('/', helloWorld);
router.post('articles/post', postArticle);
router.get('articles/get', getAllArticles);
router.get('articles/:id/detail', getArticleDetail);
router.get('keywords/:hashtag', getHashtag);

export default router;
