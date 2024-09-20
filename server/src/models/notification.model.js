const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipients: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    ],
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    type: {
        type: String,
        enum: ['like', 'comment', 'friend_request', 'group_request', 'follow', 'report', 'custom'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: false
    },
    isRead: {
        type: Boolean,
        default: false
    },
},
    {
        timestamps: true
    }
);

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
