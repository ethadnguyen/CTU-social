const express = require('express');
const { getMessages, markAsSeen, createConversation, getFriends, createMessage, addRecipient, getAllConversations } = require('../controllers/message.controller');
const upload = require('../utils/upload');
const router = express.Router();



router.get('/conversations/:userId', getAllConversations);

router.post('/conversation', createConversation);

router.put('/conversation/:conversationId', addRecipient);

router.get('/messages', getMessages);

router.post('/message', upload.array('media'), createMessage);

router.patch('/:conversationId/seen', markAsSeen);

router.get('/friends/:userId', getFriends);

module.exports = router;