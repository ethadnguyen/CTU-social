const express = require('express');
const path = require('path');
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();


router.get('/verify/:userId/:token', UserController.verifyEmail);

router.get('/get-user/:id', authMiddleware, UserController.getUser);

router.put('/:userId', authMiddleware, UserController.updateUser);

router.post('/friend-request', authMiddleware, UserController.friendRequest);

router.post('/get-friend-request', authMiddleware, UserController.getFriendRequest);

router.post('/accept-request', authMiddleware, UserController.acceptRequest);

router.post('/unfriend', authMiddleware, UserController.unFriend);

router.post('/follow', authMiddleware, UserController.followUser);

router.post('/unfollow', authMiddleware, UserController.unfollowUser);

router.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/build', 'index.html'));
});

router.get('/verified', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/build', 'index.html'));
});


module.exports = router;