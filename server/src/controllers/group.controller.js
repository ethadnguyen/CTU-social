const Comment = require('../models/comment.model');
const Group = require('../models/group.model');
const Post = require('../models/post.model');
const User = require('../models/user.model');
const upload = require('../utils/upload');



const getGroups = async (req, res) => {
    try {
        const groups = await Group.find().select('name description posts');
        return res.status(200).json(groups);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getGroup = async (req, res) => {
    const { groupId } = req.params;
    try {
        const group = await Group.findById(groupId).select('name description posts');
        if (!group) {
            return res.status(404).json({ message: 'Nhóm không tồn tại' });
        }
        return res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getGroupPosts = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { search } = req.query;

        const group = await Group.findById(groupId).select('name description posts').populate('posts');

        if (!group) {
            return res.status(404).json({ message: 'Nhóm không tồn tại' });
        }

        const postIds = group.posts.map(post => post._id);

        const searchPostQuery = {
            _id: { $in: postIds },
            ...(search && {
                content: { $regex: search, $options: 'i' }
            })
        };

        const posts = await Post.find(searchPostQuery)
            .populate({
                path: 'user',
                select: 'firstName lastName avatar -password',
                populate: {
                    path: 'faculty',
                    select: 'name'
                },
            })
            .populate({
                path: 'user',
                populate: {
                    path: 'major',
                    select: 'majorName academicYear',
                },
            })
            .sort({ _id: -1 });

        res.status(200).json({
            message: 'Lấy bài viết thành công',
            posts,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const getGroupPost = async (req, res) => {
    const { groupId, postId } = req.params;
    try {


        const group = await Group.findById(groupId).select('name description posts').populate('posts');

        if (!group) {
            return res.status(404).json({ message: 'Nhóm không tồn tại' });
        }

        const post = group.posts.find(post => post._id.toString() === postId);

        if (!post) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }

        const postDetails = await Post.findById(postId)
            .populate({
                path: 'user',
                select: 'firstName lastName avatar -password',
                populate: {
                    path: 'faculty',
                    select: 'name'
                },
            })
            .populate({
                path: 'user',
                populate: {
                    path: 'major',
                    select: 'majorName academicYear',
                },
            });

        res.status(200).json({
            message: 'Lấy bài viết thành công',
            post: postDetails,
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Lỗi lấy bài viết',
            error: error.message
        });
    }
};

const createGroupPost = async (req, res) => {
    try {
        console.log(req.body);
        const { userId } = req.body.user;
        const { content, groupId } = req.body;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Nhóm không tồn tại' });
        }

        const isMember = group.members.includes(userId);

        if (!isMember) {
            return res.status(403).json({ message: 'Bạn không phải là thành viên của nhóm' });
        }

        const images = req.files && req.files['images'] ? req.files['images'].map(file => file.path) : [];
        const files = req.files && req.files['files'] ? req.files['files'].map(file => file.path) : [];

        const newPost = new Post({
            user: userId,
            content,
            images,
            files
        });

        await newPost.save();

        group.posts.push(newPost._id);
        await group.save();

        res.status(201).json({
            message: 'Tạo bài viết trong nhóm thành công',
            post: newPost
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const updateGroupPost = async (req, res) => {
    try {
        const { groupId, postId } = req.params;
        const userId = req.body.userId;
        const { content } = req.body;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Nhóm không tồn tại' });
        }

        const isMember = group.members.includes(userId);
        if (!isMember) {
            return res.status(403).json({ message: 'Bạn không có quyền cập nhật bài viết này' });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }

        if (req.files['images']) {
            const imageUploadPromises = req.files['images'].map(file =>
                upload(file.path, 'CTU-social/images')
            );
            const uploadedImages = await Promise.all(imageUploadPromises);
            const newImageUrls = uploadedImages.map(result => result.secure_url);
            post.images = [...post.images, ...newImageUrls];
        }

        if (req.files['files']) {
            const fileUploadPromises = req.files['files'].map(file =>
                upload(file.path, 'CTU-social/files')
            );
            const uploadedFiles = await Promise.all(fileUploadPromises);
            const newFileUrls = uploadedFiles.map(result => result.secure_url);
            post.files = [...post.files, ...newFileUrls];
        }

        post.content = content || post.content;

        await post.save();
        res.status(200).json({ message: 'Cập nhật bài viết trong nhóm thành công', post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getGroups,
    getGroup,
    getGroupPosts,
    getGroupPost,
    createGroupPost,
    updateGroupPost,
};