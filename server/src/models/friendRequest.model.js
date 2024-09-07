const mongoose = require('mongoose');

const FriendRequestSchema = new mongoose.Schema({
    requestTo: { type: Schema.Types.ObjectId, ref: 'User' },
    requestFrom: { type: Schema.Types.ObjectId, ref: 'User' },
    requestStatus: { type: String, default: 'PENDING' }
},
    {
        timestamps: true
    }
);

const FriendRequest = mongoose.model('FriendRequest', FriendRequestSchema);

module.exports = FriendRequest;