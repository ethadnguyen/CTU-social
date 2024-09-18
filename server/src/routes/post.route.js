const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const {
    getPosts,
    getPost,
    getUserPost,
    likePost,
    reportPost,
    likePostComment,
    reportPostComment,
    getComments,
    createPost,
    updatePost,
    commentPost,
    replyPostComment,
    deletePost,
    deletePostComment
} = require('../controllers/post.controller');
const { checkSchema } = require('express-validator');
const createPostValidateSchema = require('../validateSchema/post');
const upload = require('../utils/upload');
const router = express.Router();

//get post
router.get('/', authMiddleware, getPosts);
router.get('/:id', authMiddleware, getPost);
router.post('get-user-post/:id', authMiddleware, getUserPost);

//create post
router.post('/create-post', authMiddleware, checkSchema(createPostValidateSchema), upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'files', maxCount: 5 }
]), createPost);

// update post
router.put('/:id', authMiddleware, updatePost);

// get comments
router.get('/comments/:postId', authMiddleware, getComments);

// like, report and comment
router.post('/like/:id', authMiddleware, likePost);
router.post('/like-comment/:id/:rid?', authMiddleware, likePostComment);
router.post('/report/:id', authMiddleware, reportPost);
router.post('/report-comment/:id/:rid?', authMiddleware, reportPostComment);
router.post('/comment/:id', authMiddleware, commentPost);
router.post('/reply-comment/:id', authMiddleware, replyPostComment);


//delete post and comment
router.delete('/:id', authMiddleware, deletePost);
router.delete('/comment/:id/:rid?', authMiddleware, deletePostComment);

module.exports = router;
