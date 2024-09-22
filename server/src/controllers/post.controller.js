const Comment = require('../models/comment.model');
const Group = require('../models/group.model');
const Post = require('../models/post.model');
const User = require('../models/user.model');
const upload = require('../utils/upload');

const getPosts = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { search } = req.query;


        const user = await User.findById(userId)
            .populate('faculty', 'name')
            .populate('major', 'majorName academicYear');

        const friends = user?.friends?.toString().split(',') ?? [];
        friends.push(userId);

        const searchPostQuery = {
            $or: [
                {
                    content: { $regex: search, $options: 'i' },
                },
            ],
        };

        const posts = await Post.find(search ? searchPostQuery : {})
            .populate({
                path: 'user',
                select: 'firstName lastName avatar -password',
                populate: {
                    'path': 'faculty',
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

        const friendsPosts = posts?.filter((post) => {
            return friends.includes(post?.user?._id.toString());
        });

        const otherPosts = posts.filter((post) => {
            !friends.includes(post?.user?._id.toString());
        });

        let postsRes = null;

        if (friendsPosts.length > 0) {
            postsRes = search ? friendsPosts : [...friendsPosts, ...otherPosts];
        } else {
            postsRes = posts;
        }

        res.status(200).json({
            message: 'Lấy bài viết thành công',
            posts: postsRes,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const getPost = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.findById(id)
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
            });

        res.status(200).json({
            message: 'Lấy bài viết thành công',
            post
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message })
    }
};

const getGroupPosts = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { search } = req.query;

        const group = await Group.findById(groupId).populate('posts');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
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


        const group = await Group.findById(groupId).populate('posts');

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

const getUserPost = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.findById(id)
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
            .sort({ _id: -1 });

        res.status(200).json({
            message: 'Lấy bài viết thành công',
            post
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message })
    }
};

const getComments = async (req, res) => {
    try {
        const { postId } = req.params;

        const comments = await Comment.find({ post: postId })
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
                select: 'firstName lastName avatar -password',
                populate: {
                    path: 'major',
                    select: 'majorName academicYear'
                }
            })
            .sort({ _id: -1 });

        res.status(200).json({
            message: 'Lấy bình luận thành công',
            comments
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
};

const likePost = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { id } = req.params;

        const post = await Post.findById(id);

        const userLiked = post.likedBy.some((user) => user.toString() === userId);

        if (!userLiked) {
            post.likes += 1;
            post.likedBy.push(userId);
        } else {
            post.likes -= 1;
            post.likedBy = post.likedBy.filter((user) => user.toString() !== userId);
        }

        const updatedPost = await post.save();

        res.status(200).json({
            message: `${userLiked ? 'Bỏ ' : ''}thích bài viết thành công`,
            post: updatedPost
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const reportPost = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { id } = req.params;

        const post = await Post.findById(id);

        const userReported = post.reportedBy.some((user) => user.toString() === userId);

        if (!userReported) {
            post.reports += 1;
            post.reportedBy.push(userId);
        } else {
            post.reports -= 1;
            post.reportedBy = post.reportedBy.filter((user) => user.toString() !== userId);
        }

        const updatedPost = await post.save();

        res.status(200).json({
            message: 'Báo cáo bài viết thành công',
            post: updatedPost
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

const likePostComment = async (req, res) => {
    const { userId } = req.body.user;
    const { id, rid } = req.params;

    try {
        if (!rid) {
            const comment = await Comment.findById(id);

            const userLiked = comment.likedBy.some((user) => user.toString() === userId);

            if (!userLiked) {
                comment.likes += 1;
                comment.likedBy.push(userId);
            } else {
                comment.likes -= 1;
                comment.likedBy = comment.likedBy.filter((user) => user.toString() !== userId);
            }

            const updatedComment = await comment.save();

            res.status(201).json({
                message: 'Like bình luận thành công',
                comment: updatedComment
            });
        } else {
            const comment = await Comment.findOne(
                { _id: id },
                {
                    replies: {
                        $elemMatch: { _id: rid }
                    },
                },
            );

            const userLiked = comment?.replies[0]?.likedBy.some(
                (user) => user.toString() === userId,
            );

            if (!userLiked) {
                comment.replies[0].likes += 1;
                comment.replies[0].likedBy.push(userId);
            } else {
                comment.replies[0].likes -= 1;
                comment.replies[0].likedBy = comment.replies[0].likedBy.filter(
                    (user) => user.toString() !== userId,
                );
            }

            const query = { _id: id, 'replies._id': rid };

            const update = {
                $set: {
                    'replies.$.likes': comment.replies[0].likes,
                    'replies.$.likedBy': comment.replies[0].likedBy,
                },
            };

            const updatedReply = await Comment.updateOne(query, update, { new: true });

            res.status(201).json({
                message: 'Like bình luận thành công',
                rComment: updatedReply
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const reportPostComment = async (req, res) => {
    const { userId } = req.body.user;
    const { id, rid } = req.params;

    try {
        if (!rid) {
            const comment = await Comment.findById(id);

            const userReported = comment.reportedBy.some((user) => user.toString() === userId);

            if (!userReported) {
                comment.reports += 1;
                comment.reportedBy.push(userId);
            } else {
                comment.reports -= 1;
                comment.reportedBy = comment.reportedBy.filter((user) => user.toString() !== userId);
            }

            const updatedComment = await comment.save();

            res.status(201).json({
                message: 'Báo cáo bình luận thành công',
                comment: updatedComment
            });
        } else {
            const comment = await Comment.findOne(
                { _id: id },
                {
                    replies: {
                        $elemMatch: { _id: rid }
                    },
                },
            );

            const userReported = comment?.replies[0]?.reportedBy.some(
                (user) => user.toString() === userId,
            );

            if (!userReported) {
                comment.replies[0].reports += 1;
                comment.replies[0].reportedBy.push(userId);
            } else {
                comment.replies[0].reports -= 1;
                comment.replies[0].reportedBy = comment.replies[0].reportedBy.filter(
                    (user) => user.toString() !== userId,
                );
            }

            const query = { _id: id, 'replies._id': rid };

            const update = {
                $set: {
                    'replies.$.reports': comment.replies[0].reports,
                    'replies.$.reportedBy': comment.replies[0].reportedBy,
                },
            };

            const updatedReply = await Comment.updateOne(query, update, { new: true });

            res.status(201).json({
                message: 'Báo cáo bình luận thành công',
                rComment: updatedReply
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const savePost = async (req, res) => {
    const { userId } = req.body.user;
    const { id } = req.params;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        const post = await Post.findById(id)
            .populate({
                path: 'user',
                select: 'firstName lastName',
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
            });

        if (!post) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }

        const isSaved = user.saved.includes(id);

        if (!isSaved) {
            user.saved.push(id);
        } else {
            user.saved = user.saved.filter(postId => postId.toString() !== id);
        }

        await user.save();

        res.status(200).json({
            message: isSaved ? 'Bỏ lưu bài viết thành công' : 'Lưu bài viết thành công',
            savedPosts: user.saved,
            postOwner: {
                firstName: post.user.firstName,
                lastName: post.user.lastName,
                faculty: post.user.faculty.name,
                major: {
                    majorName: post.user.major.majorName,
                    academicYear: post.user.major.academicYear
                }
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const commentPost = async (req, res) => {
    try {
        const { content, from } = req.body;
        const { userId } = req.body.user;
        const { id } = req.params;

        const newComment = new Comment({ content, from, user: userId, post: id });

        await newComment.save();

        const post = await Post.findById(id);

        post.comments.push(newComment._id);

        const updatedPost = await Post.findByIdAndUpdate(id, post, { new: true });

        res.status(201).json({
            message: 'Bình luận bài viết thành công',
            post: updatedPost,
            comment: newComment
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
};

const replyPostComment = async (req, res) => {
    const { userId } = req.body.user;
    const { comment, replyAt, from } = req.body;
    const { id } = req.params;

    if (!comment) {
        return res.status(400).json({ message: 'Nội dung bình luận không được để trống' });
    }

    try {
        const comment = await Comment.findById(id);

        comment.replies.push({
            content: comment,
            replyAt,
            from,
            user: userId,
            created_At: Date.now(),
        });

        await comment.save();

        res.status(200).json({
            message: 'Trả lời bình luận thành công',
            comment
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
};

const createPost = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { content } = req.body;

        const images = req.files['images'] ? req.files['images'].map(file => file.path) : [];
        const files = req.files['files'] ? req.files['files'].map(file => file.path) : [];

        const newPost = new Post({
            user: userId,
            content,
            images,
            files
        });

        await newPost.save();

        res.status(201).json({ message: 'Tạo bài viết thành công', post: newPost });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const createGroupPost = async (req, res) => {
    try {
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

        const images = req.files['images'] ? req.files['images'].map(file => file.path) : [];
        const files = req.files['files'] ? req.files['files'].map(file => file.path) : [];

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

const updatePost = async (req, res) => {

    try {
        const id = req.params.id;
        const { content } = req.body;

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }

        if (req.files['images']) {
            const imageUploadPromises = req.files['images'].map(file => upload(file.path, 'CTU-social/images'));
            const uploadedImages = await Promise.all(imageUploadPromises);
            const newImageUrls = uploadedImages.map(result => result.secure_url);

            post.images = [...post.images, ...newImageUrls];
        }

        if (req.files['files']) {
            const fileUploadPromises = req.files['files'].map(file => upload(file.path, 'CTU-social/files'));
            const uploadedFiles = await Promise.all(fileUploadPromises);
            const newFileUrls = uploadedFiles.map(result => result.secure_url);

            post.files = [...post.files, ...newFileUrls];
        }

        post.content = content || post.content;

        await post.save();
        res.status(200).json({ message: 'Cập nhật bài viết thành công', post });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
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

const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }

        await post.remove();

        res.status(200).json({ message: 'Xóa bài viết thành công' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const deletePostComment = async (req, res) => {
    try {
        const { id, rid } = req.params;

        if (!rid) {
            const comment = await Comment.findById(id);

            if (!comment) {
                return res.status(404).json({ message: 'Bình luận không tồn tại' });
            }

            await comment.remove();

            res.status(200).json({ message: 'Xóa bình luận thành công' });
        } else {
            const comment = await Comment.findOne(
                { _id: id },
                {
                    replies: {
                        $elemMatch: { _id: rid }
                    },
                },
            );

            if (!comment) {
                return res.status(404).json({ message: 'Bình luận không tồn tại' });
            }

            comment.replies = comment.replies.filter((reply) => reply._id.toString() !== rid);

            await comment.save();

            res.status(200).json({ message: 'Xóa bình luận thành công' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    getPosts,
    getPost,
    getGroupPosts,
    getGroupPost,
    getUserPost,
    getComments,
    likePost,
    reportPost,
    savePost,
    likePostComment,
    reportPostComment,
    commentPost,
    replyPostComment,
    createPost,
    createGroupPost,
    updatePost,
    updateGroupPost,
    deletePost,
    deletePostComment
};