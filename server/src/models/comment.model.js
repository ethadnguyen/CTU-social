const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    reply: mongoose.Schema.Types.ObjectId,
    tag: Object,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
    likedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    reports: {
        type: Number,
        default: 0
    },
    reportedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
},
    {
        timestamps: true
    }
);

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;