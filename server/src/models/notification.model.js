const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    receiver: [
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
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['like', 'comment', 'friendRequest', 'groupRequest', 'follow', 'joinGroupRequest', 'accept', 'acceptGroupRequest', 'post', 'custom'],
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
