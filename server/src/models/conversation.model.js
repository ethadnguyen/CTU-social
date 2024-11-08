const mongoose = require('mongoose');


const conversationSchema = new mongoose.Schema(
    {
        recipients: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
        name: {
            type: String,
            default: ''
        },
        avatar: {
            type: String,
            default: ''
        },
        messages: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'Message'
            }
        ],
        lastMessage: {
            type: String,
            default: ''
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Conversation', conversationSchema);