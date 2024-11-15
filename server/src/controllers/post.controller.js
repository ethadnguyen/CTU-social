const { default: mongoose } = require('mongoose');
const Comment = require('../models/comment.model');
const Group = require('../models/group.model');
const Post = require('../models/post.model');
const User = require('../models/user.model');

// const getPosts = async (req, res) => {
//     try {
//         const { userId } = req.body.user;
//         const { search } = req.query;


//         const user = await User.findById(userId)
//             .populate('faculty', 'name')
//             .populate('major', 'majorName academicYear');

//         const friends = user?.friends?.toString().split(',') ?? [];
//         friends.push(userId);

//         const searchPostQuery = {
//             $or: [
//                 {
//                     content: { $regex: search, $options: 'i' },
//                 },
//             ],
//         };

//         const posts = await Post.find(search ? searchPostQuery : {})
//             .populate({
//                 path: 'user',
//                 select: 'firstName lastName avatar -password',
//                 populate: {
//                     'path': 'faculty',
//                     select: 'name'
//                 },
//             })
//             .populate({
//                 path: 'user',
//                 populate: {
//                     path: 'major',
//                     select: 'majorName academicYear',
//                 },
//             })
//             .sort({ _id: -1 });

//         const friendsPosts = posts?.filter((post) => {
//             return friends.includes(post?.user?._id.toString());
//         });

//         const otherPosts = posts.filter((post) => {
//             !friends.includes(post?.user?._id.toString());
//         });

//         let postsRes = null;

//         if (friendsPosts.length > 0) {
//             postsRes = search ? friendsPosts : [...friendsPosts, ...otherPosts];
//         } else {
//             postsRes = posts;
//         }

//         res.status(200).json({
//             message: 'Lấy bài viết thành công',
//             posts: postsRes,
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: error.message });
//     }
// };

const getPosts = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { search } = req.query;

        const user = await User.findById(userId)
            .populate('faculty', 'name')
            .populate('major', 'majorName academicYear');

        const friends = user?.friends?.toString().split(',') ?? [];
        const followers = user?.followers?.toString().split(',') ?? [];
        friends.push(userId);

        const searchPostQuery = {
            $and: [
                { privacy: 'public' },
                {
                    $or: [
                        {
                            content: { $regex: search, $options: 'i' },
                        },
                    ],
                },
            ],
        };

        const posts = await Post.find(search ? searchPostQuery : { privacy: 'public' })
            .populate({
                path: 'user',
                select: 'firstName lastName avatar -password',
                populate: {
                    path: 'faculty',
                    select: 'name',
                },
            })
            .populate({
                path: 'user',
                populate: {
                    path: 'major',
                    select: 'majorName academicYear',
                },
            })
            .populate({
                path: 'group',
            })
            .populate({
                path: 'comments',
            })
            .populate({
                path: 'sharedBy',
                select: 'firstName lastName avatar',
            })
            .sort({ _id: -1 });

        const friendsAndFollowers = [...new Set([...friends, ...followers])];

        const friendsPosts = posts?.filter((post) => {
            return friendsAndFollowers.includes(post?.user?._id.toString()) && !post.group;
        });

        const otherPosts = posts.filter((post) => {
            return !friendsAndFollowers.includes(post?.user?._id.toString()) && !post.group;
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

const getUserPosts = async (req, res) => {
    const { userId } = req.params;
    try {
        const posts = await Post.find({ user: userId })
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

        if (!posts.length) {
            return res.status(404).json({ message: 'Không có bài viết nào' });
        }

        res.status(200).json({
            message: 'Lấy bài viết của người dùng thành công',
            posts
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
                select: 'firstName lastName avatar',
                populate: {
                    path: 'faculty',
                    select: 'name'
                }
            })
            .populate({
                path: 'user',
                select: 'firstName lastName avatar',
                populate: {
                    path: 'major',
                    select: 'majorName academicYear'
                }
            })
            .populate({
                path: 'replies.user',
                select: 'firstName lastName avatar',
                populate: {
                    path: 'faculty',
                    select: 'name'
                }
            })
            .populate({
                path: 'replies.user',
                select: 'firstName lastName avatar',
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
            message: `${userReported ? 'Bỏ ' : ''}báo cáo bài viết thành công`,
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
            const comment = await Comment.findById(id)
                .populate({
                    path: 'user',
                    select: 'firstName lastName avatar',
                    populate: {
                        path: 'faculty',
                    }
                })
                .populate({
                    path: 'user',
                    populate: {
                        path: 'major'
                    }
                })
                .populate({
                    path: 'replies.user',
                    select: 'firstName lastName avatar',
                });

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
            )
                .populate({
                    path: 'user',
                    select: 'firstName lastName avatar',
                    populate: {
                        path: 'faculty',
                    }
                })
                .populate({
                    path: 'user',
                    populate: {
                        path: 'major'
                    }
                })
                .populate({
                    path: 'replies.user',
                    select: 'firstName lastName avatar',
                });

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

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }

        const isSaved = user.saved.includes(id);

        if (!isSaved) {
            post.savedBy.push(userId);
            post.saves += 1;
            user.saved.push(id);
        } else {
            post.savedBy = post.savedBy.filter(savedUserId => savedUserId.toString() !== userId);
            post.saves -= 1;
            user.saved = user.saved.filter(postId => postId.toString() !== id);
        }

        await user.save();
        await post.save();

        const updatedPost = await Post.findById(id)
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
                path: 'group',
            })
            .populate({
                path: 'sharedBy',
                select: 'firstName lastName avatar'
            });

        res.status(200).json({
            message: isSaved ? 'Bỏ lưu bài viết thành công' : 'Lưu bài viết thành công',
            post: updatedPost,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const getSavedPosts = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        const savedPosts = await Post.find({ _id: { $in: user.saved } })
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
            message: 'Lấy bài viết đã lưu thành công',
            savedPosts
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const sharePost = async (req, res) => {
    const { userId } = req.body.user;
    const { id } = req.params;

    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }

        const userShared = post.sharedBy.includes(userId);

        if (userShared) {
            post.sharedBy = post.sharedBy.filter((user) => user.toString() !== userId);
            post.shares -= 1;
        } else {
            post.sharedBy.push(userId);
            post.shares += 1;
        }

        await post.save();

        const updatedPost = await Post.findById(id)
            .populate({
                path: 'user',
                select: 'firstName lastName avatar -password',
                populate: {
                    path: 'faculty',
                    select: 'name',
                },
            })
            .populate({
                path: 'user',
                populate: {
                    path: 'major',
                    select: 'majorName academicYear',
                },
            })
            .populate({
                path: 'group',
            })
            .populate({
                path: 'comments',
            })
            .populate({
                path: 'sharedBy',
                select: 'firstName lastName avatar',
            });

        res.status(201).json({
            message: userShared ? 'Bỏ chia sẻ bài viết thành công' : 'Chia sẻ bài viết thành công',
            post: updatedPost,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const getSharedPosts = async (req, res) => {
    const { userId } = req.body.user;

    try {
        const sharedPosts = await Post.find({
            $or: [
                { 'visibility': 'public' },
                { sharedBy: userId }
            ]
        });

        res.status(200).json({ message: 'Lấy bài viết chia sẻ thành công', sharedPosts });
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

        const updatedPost = await Post.findByIdAndUpdate(id, post, { new: true })
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
            });

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
    const { content: replyComment, replyAt, from } = req.body;
    const { id } = req.params;

    if (!replyComment) {
        return res.status(400).json({ message: 'Nội dung bình luận không được để trống' });
    }

    try {
        const comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).json({ message: 'Bình luận không tồn tại' });
        }

        const newReply = {
            rid: new mongoose.Types.ObjectId(),
            content: replyComment,
            from,
            user: userId,
            replyAt: replyAt,
        }

        comment.replies.push(newReply);

        await comment.save();

        res.status(201).json({
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
        const { userId, content, privacy } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'userId là bắt buộc!' });
        }

        const images = req.files && req.files['images'] ? req.files['images'].map(file => file.path) : [];
        // const files = req.files && req.files['files'] ? req.files['files'].map(file => file.path) : [];

        const newPost = new Post({
            user: userId,
            content,
            images,
            privacy
        });

        await newPost.save();

        const user = await User.findById(userId);
        user.posts.push(newPost._id);
        await user.save();

        res.status(201).json({ message: 'Tạo bài viết thành công', post: newPost });
    } catch (error) {
        console.log(error);
        console.log('Uploaded files:', req.files);
        res.status(500).json({ message: error.message });
    }
};

const updatePost = async (req, res) => {
    const { userId, content, privacy, remainingImages } = req.body;
    const id = req.params.id;

    try {
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }

        if (post.user.toString() !== userId) {
            return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa bài viết này' });
        }

        if (remainingImages && Array.isArray(remainingImages)) {
            post.images = post.images.filter(image => remainingImages.includes(image));
        }

        if (req.files && req.files['images']) {
            const newImagePaths = req.files['images'].map(file => file.path);
            post.images = [...post.images, ...newImagePaths];
        }

        if (content !== undefined) {
            post.content = content;
        }
        if (privacy !== undefined) {
            post.privacy = privacy;
        }

        await post.save();

        const updatedPost = await Post.findById(id)
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
            });
        res.status(200).json({ message: 'Cập nhật bài viết thành công', post: updatedPost });
    } catch (error) {
        console.log(error);
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

        await Post.deleteOne({ _id: id });

        await User.updateOne(
            { _id: post.user },
            { $pull: { posts: id } }
        );

        await Comment.deleteMany({ post: id });

        if (post.group) {
            await Group.updateOne(
                { _id: post.group },
                { $pull: { posts: id } }
            );
        }

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

            await comment.deleteOne();

            await Post.updateOne(
                { comments: id },
                { $pull: { comments: id } }
            );

            return res.status(200).json({ message: 'Xóa bình luận thành công' });
        } else {
            const comment = await Comment.findById(id);

            if (!comment) {
                return res.status(404).json({ message: 'Bình luận không tồn tại' });
            }

            comment.replies = comment.replies.filter((reply) => reply._id.toString() !== rid);

            await comment.save();

            return res.status(200).json({ message: 'Xóa phản hồi thành công' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    getPosts,
    getPost,
    getUserPosts,
    getUserPost,
    getComments,
    likePost,
    reportPost,
    savePost,
    getSavedPosts,
    likePostComment,
    reportPostComment,
    sharePost,
    getSharedPosts,
    commentPost,
    replyPostComment,
    createPost,
    updatePost,
    deletePost,
    deletePostComment
};