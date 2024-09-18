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


router.get('/group/:groupId', authMiddleware, getGroupPosts);


