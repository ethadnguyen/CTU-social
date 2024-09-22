const express = require('express');
const path = require('path');
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validateCreateGroupRequest } = require('../middlewares/validate.middleware');
const router = express.Router();


router.get('/verify/:userId/:token', UserController.verifyEmail);

// PASSWORD RESET
router.post('/request-passwordreset', UserController.requestPasswordReset);
router.post('/reset-password', UserController.changePassword);
router.get('/reset-password/:userId/:token', UserController.resetPassword);

router.get('/get-user/:id', authMiddleware, UserController.getUser);

router.put('/:userId', authMiddleware, UserController.updateUser);

router.post('/friend-request', authMiddleware, UserController.friendRequest);

router.post('/group-request', authMiddleware, validateCreateGroupRequest, UserController.createGroupRequest);

router.post('/get-friend-request', authMiddleware, UserController.getFriendRequest);

router.post('/accept-request', authMiddleware, UserController.acceptRequest);

router.post('/reject-request', authMiddleware, UserController.rejectRequest);

router.post('/un-friend', authMiddleware, UserController.unFriend);

router.post('/unfriend', authMiddleware, UserController.unFriend);

router.post('/follow', authMiddleware, UserController.followUser);

router.post('/unfollow', authMiddleware, UserController.unfollowUser);


router.get('/verified', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/build', 'index.html'));
});

router.get('/resetpassword', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/build', 'index.html'));
});


module.exports = router;