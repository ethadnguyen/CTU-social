const Comment = require('../models/comment.model');
const Group = require('../models/group.model');
const Post = require('../models/post.model');
const User = require('../models/user.model');
const upload = require('../utils/upload');

const getGroupPosts = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        const posts = await Post.find({ group: groupId });
        return res.status(200).json(posts);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};