const express = require('express');
const { getMessages, markAsSeen, createConversation, getFriends, createMessage, addRecipient, getAllConversations } = require('../controllers/message.controller');
const upload = require('../utils/upload');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();



router.get('/conversations/:userId', authMiddleware, getAllConversations);

router.post('/conversation', authMiddleware, createConversation);

router.put('/conversation/:conversationId', authMiddleware, addRecipient);

router.get('/messages', authMiddleware, getMessages);

router.post('/message', authMiddleware, upload.array('media'), createMessage);

router.patch('/:conversationId/seen', authMiddleware, markAsSeen);

router.get('/friends/:userId', authMiddleware, getFriends);

module.exports = router;