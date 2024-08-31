const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    images: [{
        type: String,
        required: false
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        }
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    reports: [
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

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
