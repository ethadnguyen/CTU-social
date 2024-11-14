const mongoose = require('mongoose');

const JoinGroupRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    }
},
    {
        timestamps: true
    }
);

const JoinGroupRequest = mongoose.model('JoinGroupRequest', JoinGroupRequestSchema);

module.exports = JoinGroupRequest;