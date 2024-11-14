const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const { getGroups,
    getGroup,
    getGroupPosts,
    createGroupPost,
    updateGroupPost,
    getGroupPost,
    getJoinGroupRequests,
    acceptJoinGroupRequest,
    rejectGroupRequest,
    cancelJoinGroupRequest,
    joinGroupRequest,
    deleteMember,
    updateGroup,
} = require('../controllers/group.controller');
const upload = require('../utils/upload');
const { validateCreateGroupPost } = require('../middlewares/validate.middleware');
const router = express.Router();


router.get('/', authMiddleware, getGroups);

router.get('/:groupId', authMiddleware, getGroup);

router.put('/:groupId', authMiddleware, upload.single('banner'), updateGroup);

router.get('/:groupId/posts', authMiddleware, getGroupPosts);

router.get('/:groupId/posts/:postId', authMiddleware, getGroupPost);

router.post('/create-post', authMiddleware, upload.fields([
    { name: 'images', maxCount: 5 },
]), validateCreateGroupPost, createGroupPost);


router.get('/:groupId/join-requests', authMiddleware, getJoinGroupRequests);

router.post('/join-request', authMiddleware, joinGroupRequest);

router.post('/cancel-request', authMiddleware, cancelJoinGroupRequest);

router.post('/:groupId/accept-request', authMiddleware, acceptJoinGroupRequest);

router.post('/reject-request', authMiddleware, rejectGroupRequest);

router.put('/:groupId/:postId', authMiddleware, validateCreateGroupPost, updateGroupPost);

router.post('/:groupId/delete-member', authMiddleware, deleteMember);


module.exports = router;


