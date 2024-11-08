const express = require('express');
const path = require('path');
const UserController = require('../controllers/user.controller');
const { updateUser } = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validateCreateGroupRequest } = require('../middlewares/validate.middleware');
const router = express.Router();
const upload = require('../utils/upload');


router.get('/verify/:userId/:token', UserController.verifyEmail);

// PASSWORD RESET
router.post('/request-passwordreset', UserController.requestPasswordReset);
router.post('/reset-password', UserController.changePassword);
router.get('/reset-password/:userId/:token', UserController.resetPassword);

router.get('/get-user/:id', authMiddleware, UserController.getUser);

router.put('/:userId', authMiddleware, upload.fields([{
    name: 'avatar',
    maxCount: 1
}]), updateUser);

router.post('/friend-request', authMiddleware, UserController.friendRequest);

router.post('/group-request', authMiddleware, validateCreateGroupRequest, UserController.createGroupRequest);

router.get('/friend-requests', authMiddleware, UserController.getFriendRequests);

router.get('/friend-requests/:userId', authMiddleware, UserController.getUserFriendRequests);

router.post('/accept-request', authMiddleware, UserController.acceptRequest);

router.post('/cancel-request', authMiddleware, UserController.cancelRequest);

router.post('/reject-request', authMiddleware, UserController.rejectRequest);

router.post('/unfriend', authMiddleware, UserController.unFriend);

router.post('/follow', authMiddleware, UserController.followUser);

router.post('/unfollow', authMiddleware, UserController.unfollowUser);

router.get('/notifications', authMiddleware, UserController.getNotifications);

router.post('/create-notification', authMiddleware, UserController.createNotification);

router.post('/mark-as-read', authMiddleware, UserController.markAsAllRead);

router.post('/mark-as-read/:notificationId', authMiddleware, UserController.markAsRead);


router.get('/verified', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/build', 'index.html'));
});

router.get('/resetpassword', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/build', 'index.html'));
});


module.exports = router;