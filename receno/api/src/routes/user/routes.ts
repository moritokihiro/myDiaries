import { helloWorld } from '../../controllers/helloWorld';
import {
  postArticle,
  getAllArticles,
  getArticleDetail,
  getHashtag,
} from '../../controllers/article';
import upload from '../../utils/upload';

const router = require('express').Router();

router.get('/', helloWorld);
router.post('/articles/post', upload.single('image'), postArticle);
router.get('/articles/get', getAllArticles);
router.get('/articles/:id/detail', getArticleDetail);
router.get('/keywords/:hashtag', getHashtag);

export default router;
