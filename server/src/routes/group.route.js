const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const { getGroups, getGroup, getGroupPosts, createGroupPost, updateGroupPost, getGroupPost } = require('../controllers/group.controller');
const upload = require('../utils/upload');
const { validateCreateGroupPost } = require('../middlewares/validate.middleware');
const router = express.Router();


router.get('/', authMiddleware, getGroups);

router.get('/:groupId', authMiddleware, getGroup);

router.get('/:groupId/posts', authMiddleware, getGroupPosts);

router.get('/:groupId/posts/:postId', authMiddleware, getGroupPost);

router.post('/create-post', authMiddleware, upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'files', maxCount: 5 }
]), validateCreateGroupPost, createGroupPost);

router.put('/:groupId/:postId', authMiddleware, validateCreateGroupPost, updateGroupPost);


module.exports = router;


