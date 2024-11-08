const conversationModel = require('../models/conversation.model');
const messageModel = require('../models/message.model');
const userModel = require('../models/user.model');


const createConversation = async (req, res) => {
    const { senderId, friendId } = req.body;

    try {
        let conversation = await conversationModel.findOne({
            recipients: { $all: [senderId] },
        });

        const friend = await userModel.findById(friendId);
        const sender = await userModel.findById(senderId);

        if (!conversation) {
            conversation = new conversationModel({
                recipients: [senderId],
                name: `${sender.firstName} - ${friend.firstName}`,
            });
        }
        await conversation.save();

        const newConversation = await conversationModel.findById(conversation._id).populate({
            path: 'messages',
            populate: [
                {
                    path: 'sender',
                    select: '-password'
                },
                {
                    path: 'recipient',
                    select: '-password'
                }
            ]
        })

        res.status(200).json({
            message: 'Tạo cuộc trò chuyện thành công',
            conversation: newConversation
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Lỗi tạo cuộc trò chuyện'
        });
    }
};

const addRecipient = async (req, res) => {
    const { conversationId } = req.params;
    const { userId } = req.body;

    try {
        const conversation = await conversationModel.findById(conversationId).populate({
            path: 'messages',
            populate: [
                {
                    path: 'sender',
                    select: '-password'
                },
                {
                    path: 'recipient',
                    select: '-password'
                }
            ]
        });
        if (!conversation) {
            return res.status(404).json({ error: 'Không tìm thấy cuộc trò chuyện' });
        }
        const user = await userModel.findById(userId);
        if (!conversation.recipients.includes(userId)) {
            conversation.recipients.push(userId);
            await conversation.save();
        }

        res.status(200).json({ conversation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi thêm thành viên vào cuộc trò chuyện' });
    }
};

const createMessage = async (req, res) => {
    const { conversationId, senderId, recipientId, text } = req.body;
    const media = req.files ? req.files.map((file) => file.path) : [];

    try {
        const message = new messageModel({
            conversationId,
            sender: senderId,
            recipient: recipientId,
            text,
            media
        });

        await message.save();

        const conversation = await conversationModel.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                message: 'Không tìm thấy cuộc trò chuyện'
            });
        }

        conversation.messages.push(message._id);
        conversation.lastMessage = text;
        await conversation.save();

        const newMessage = await messageModel.findById(message._id).populate('sender').populate('recipient');

        res.status(200).json({
            message: newMessage
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Lỗi tạo tin nhắn'
        });
    }
};

const getAllConversations = async (req, res) => {
    try {
        const conversations = await conversationModel.find().populate({
            path: 'messages',
            populate: [
                {
                    path: 'sender',
                    select: '-password'
                },
                {
                    'path': 'recipient',
                    select: '-password'
                }
            ]
        });

        res.status(200).json({
            conversations
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Lỗi lấy tất cả cuộc trò chuyện'
        });
    }
};

const getMessages = async (req, res) => {
    const { conversationId } = req.params;

    try {
        const messages = await messageModel.find({
            conversationId
        }).populate('sender').populate('recipient');

        res.status(200).json({
            messages
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Lỗi lấy tin nhắn'
        });
    }
};

const markAsSeen = async (req, res) => {
    const { conversationId } = req.params;
    const { userId } = req.body;

    try {
        const messages = await messageModel.updateMany(
            { conversationId, recipient: userId },
            { seen: true }
        );

        res.status(200).json({
            messages
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Lỗi đánh dấu đã xem'
        });
    }
};

const getFriends = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'Không tìm thấy người dùng'
            });
        }

        const friends = await userModel.find({
            _id: { $in: user.friends }
        }).populate('faculty').populate('major');

        res.status(200).json({
            friends
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Lỗi lấy bạn bè'
        });
    }
}

module.exports = {
    createConversation,
    createMessage,
    getAllConversations,
    getMessages,
    markAsSeen,
    getFriends,
    addRecipient
};