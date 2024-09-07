const mongoose = require('mongoose');

const FriendRequestSchema = new mongoose.Schema({
    requestTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    requestFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    requestStatus: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
        default: 'PENDING'
    }
},
    {
        timestamps: true
    }
);

const FriendRequest = mongoose.model('FriendRequest', FriendRequestSchema);

module.exports = FriendRequest;