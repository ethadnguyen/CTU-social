const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    replies: [
        {
            rid: { type: mongoose.Schema.Types.ObjectId },
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            from: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            replyAt: { type: String, default: '' },
            content: { type: String, required: true },
            created_At: { type: Date, default: Date.now() },
            updated_At: { type: Date, default: Date.now() },
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
    ],
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