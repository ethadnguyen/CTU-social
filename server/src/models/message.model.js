const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Types.ObjectId,
            ref: 'Conversation',
        },
        sender: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
        },
        recipient: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
        },
        text: {
            type: String,
        },
        media: Array,
        seen: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Message', messageSchema);