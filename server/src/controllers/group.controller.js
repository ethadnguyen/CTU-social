const Comment = require('../models/comment.model');
const Group = require('../models/group.model');
const JoinGroupRequest = require('../models/joinGroupRequest.model');
const Post = require('../models/post.model');
const User = require('../models/user.model');
const upload = require('../utils/upload');

const getGroups = async (req, res) => {
    try {
        const { search } = req.query;

        const searchQuery = search ? { name: { $regex: search, $options: 'i' } } : {};

        const groups = await Group.find(searchQuery)
            .populate('posts')
            .populate({
                path: 'owner',
                select: '-password',
            })
            .populate({
                path: 'members',
                select: '-password',
            })
            .sort({ _id: -1 });

        return res.status(200).json({
            message: 'Lấy danh sách nhóm thành công',
            groups,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getGroup = async (req, res) => {
    const { groupId } = req.params;
    try {
        const group = await Group.findById(groupId)
            .populate({
                path: 'owner',
                select: '-password',
            })
            .populate({
                path: 'members',
                select: '-password',
            })

        if (!group) {
            return res.status(404).json({ message: 'Nhóm không tồn tại' });
        }
        return res.status(200).json({
            message: 'Lấy thông tin nhóm thành công',
            group,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getGroupPosts = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { search } = req.query;

        const group = await Group.findById(groupId).populate('posts');

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
                }
            })
            .populate({
                path: 'user',
                populate: {
                    path: 'major',
                    select: 'majorName academicYear'
                }
            })
            .populate({
                path: 'user',
                populate: {
                    path: 'saved',
                    select: '-password',
                }
            })
            .populate({
                path: 'group',
            })
            .populate({
                path: 'sharedBy',
                select: 'firstName lastName avatar'
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
        const { userId, content, groupId } = req.body;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Nhóm không tồn tại' });
        }

        const isMember = group.members.includes(userId);

        if (!isMember) {
            return res.status(403).json({ message: 'Bạn không phải là thành viên của nhóm' });
        }

        const images = req.files && req.files['images'] ? req.files['images'].map(file => file.path) : [];

        const newPost = new Post({
            user: userId,
            content,
            images,
            group: groupId,
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

const updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name, description } = req.body;
        const banner = req.file && req.file.path;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Nhóm không tồn tại' });
        }

        group.name = name || group.name;
        group.description = description || group.description;
        group.banner = banner || group.banner;
        await group.save();

        const updatedGroup = await Group.findById(groupId)
            .populate('posts')
            .populate({
                path: 'owner',
                select: '-password',
            })
            .populate({
                path: 'members',
                select: '-password',
            });

        res.status(200).json({ message: 'Cập nhật thông tin nhóm thành công', group: updatedGroup });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};


const getJoinGroupRequests = async (req, res) => {
    const { groupId } = req.params;
    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Nhóm không tồn tại' });
        }

        const requests = await JoinGroupRequest.find({ group, status: 'PENDING' }).populate({
            path: 'user',
            select: '-password',
        });

        res.status(200).json({
            message: 'Lấy danh sách yêu cầu tham gia nhóm thành công',
            requests
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const joinGroupRequest = async (req, res) => {
    try {
        const { userId, groupId } = req.body;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Nhóm không tồn tại' });
        }

        const existingRequest = await JoinGroupRequest.findOne({ user: userId, group: groupId });

        if (existingRequest) {
            return res.status(400).json({ message: 'Yêu cầu tham gia nhóm đã tồn tại' });
        }

        const newRequest = new JoinGroupRequest({
            user: userId,
            group: groupId,
            status: 'PENDING',
        });

        await newRequest.save();

        res.status(201).json({
            message: 'Tạo yêu cầu tham gia nhóm thành công',
            request: newRequest,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const cancelJoinGroupRequest = async (req, res) => {
    try {
        const { userId, groupId } = req.body;

        const request = await JoinGroupRequest.findOne({ user: userId, group: groupId });

        if (!request) {
            return res.status(404).json({ message: 'Yêu cầu không tồn tại' });
        }

        await JoinGroupRequest.findByIdAndDelete(request._id);

        res.status(200).json({ message: 'Hủy yêu cầu tham gia nhóm thành công' });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const acceptJoinGroupRequest = async (req, res) => {
    const { groupId } = req.params;
    const { requestId, status } = req.body;
    try {

        const request = await JoinGroupRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: 'Yêu cầu không tồn tại' });
        }

        request.status = status;

        await request.save();

        if (status === 'APPROVED') {
            const group = await Group.findById(groupId);
            group.members.push(request.user);
            await group.save();
        }

        res.status(200).json({
            message: 'Chấp nhận yêu cầu tham gia nhóm thành công',
            request,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const rejectGroupRequest = async (req, res) => {
    try {
        const { requestId } = req.body;

        const request = await JoinGroupRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: 'Yêu cầu không tồn tại' });
        }

        await JoinGroupRequest.findByIdAndDelete(requestId);

        res.status(200).json({ message: 'Từ chối yêu cầu tham gia nhóm thành công' });

    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const deleteMember = async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;

    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Nhóm không tồn tại' });
        }

        const memberIndex = group.members.indexOf(userId);

        if (memberIndex === -1) {
            return res.status(404).json({ message: 'Thành viên không tồn tại trong nhóm' });
        }

        group.members.splice(memberIndex, 1);

        const postsToDelete = [];
        for (const postId of group.posts) {
            const post = await Post.findById(postId);
            if (post && post.user.toString() === userId) {
                postsToDelete.push(postId);
            }
        }

        await Post.deleteMany({ _id: { $in: postsToDelete } });

        group.posts = group.posts.filter(postId => !postsToDelete.includes(postId));

        await group.save();

        await JoinGroupRequest.deleteMany({ user: userId, group: groupId });

        res.status(200).json({ message: 'Xóa thành viên khỏi nhóm thành công' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getGroups,
    getGroup,
    getGroupPosts,
    getGroupPost,
    updateGroup,
    createGroupPost,
    updateGroupPost,
    getJoinGroupRequests,
    joinGroupRequest,
    cancelJoinGroupRequest,
    acceptJoinGroupRequest,
    rejectGroupRequest,
    deleteMember
};