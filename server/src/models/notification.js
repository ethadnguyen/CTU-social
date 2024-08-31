const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    type: {
        type: String,
        enum: ['like', 'comment', 'friend_request', 'report', 'custom'],
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
    read: {
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
