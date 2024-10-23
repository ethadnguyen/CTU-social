const mongoose = require('mongoose');


const conversationSchema = new mongoose.Schema(
    {
        recipients: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
        name: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            default: ''
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Conversation', conversationSchema);