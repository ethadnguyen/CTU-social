const Verification = require('../models/emailVerification.model');
const User = require('../models/user.model');
const { compareString, hashString } = require('../utils/index');
const { resetPasswordLink } = require('../utils/sendMail');
const FriendRequest = require('../models/friendRequest.model');
const PasswordReset = require('../models/PasswordReset.model');
const GroupRequest = require('../models/groupRequest.model');
const Notification = require('../models/notification.model');
// const Fuse = require('fuse.js');

const verifyEmail = async (req, res) => {
    const { userId, token } = req.params;

    try {
        const result = await Verification.findOne({ userId });

        if (result) {
            const { expiresAt, token: hashedToken } = result;

            if (expiresAt < Date.now()) {
                Verification.findOneAndDelete({ userId })
                    .then(() => {
                        User.findOneAndDelete({ _id: userId })
                            .then(() => {
                                const message = 'Liên kết xác thực đã hết hạn. Vui lòng đăng ký lại.';
                                res.redirect(`/users/verified?status=error&message=${message}`);
                            })
                            .catch((err) => {
                                res.redirect(`/users/verified?status=error&message=${err}`);
                            });
                    })
                    .catch((error) => {
                        console.log(error);
                        res.redirect(`/users/verified?message=${error}`);
                    });
            } else {
                compareString(token, hashedToken)
                    .then((isMatch) => {
                        if (isMatch) {
                            User.findOneAndUpdate({ _id: userId }, { isVerified: true })
                                .then(() => {
                                    Verification.findOneAndDelete({ userId })
                                        .then(() => {
                                            const message = 'Xác thực email thành công.';
                                            res.redirect(`/users/verified?status=success&message=${message}`);
                                        });
                                })
                                .catch((err) => {
                                    console.log(err);
                                    const message = 'Xác thực email thất bại.';
                                    res.redirect(`/users/verified?status=error&message=${message}`);
                                });
                        } else {
                            const message = 'Liên kết xác thực không hợp lệ.';
                            res.redirect(`/users/verified?status=error&message=${message}`);
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        res.redirect(`/users/verified?message=${err}`);
                    })
            }
        }
        else {
            const message = 'Liên kết xác thực không hợp lệ.';
            res.redirect(`/users/verified?status=error&message=${message}`);
        }
    } catch (error) {
        console.log(error);
        res.redirect(`/users/verified?status=error&message=${error}`);
    }
};

const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ status: 'FAILED', message: 'Email không tồn tại' });
        }

        const existingRequest = await PasswordReset.findOne({ email });
        if (existingRequest) {
            if (existingRequest.expiresAt > Date.now()) {
                return res.status(201).json({
                    status: 'PENDING',
                    message: 'Yêu cầu đã được gửi. Vui lòng kiểm tra hộp thư của bạn',
                });
            }
            await PasswordReset.findOneAndDelete({ email });
        }
        await resetPasswordLink(user, res);
    } catch (error) {
        console.log(error);
        res.status(404).json({ status: 'FAILED', message: error.message });
    }
};

const resetPassword = async (req, res) => {
    const { userId, token } = req.params;

    try {
        const user = await User.findById(userId);

        if (!user) {
            const message = 'Liên kết không hợp lệ. Thử lại';
            res.redirect(`/users/resetpassword?status=error&message=${message}`);
        }

        const resetPassword = await PasswordReset.findOne({ userId });

        if (!resetPassword) {
            const message = 'Liên kết không hợp lệ. Thử lại';
            res.redirect(`/users/resetpassword?status=error&message=${message}`);
        }

        const { expiresAt, token: resetToken } = resetPassword;

        if (expiresAt < Date.now()) {
            const message = 'Liên kết đã hết hạn. Thử lại';
            res.redirect(`/users/resetpassword?status=error&message=${message}`);
        } else {
            const isMatch = await compareString(token, resetToken);

            if (!isMatch) {
                const message = 'Liên kết không hợp lệ. Thử lại';
                res.redirect(`/users/resetpassword?status=error&message=${message}`);
            } else {
                res.redirect(`/users/resetpassword?type=reset&id=${userId}`);
            }
        }
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
};

const changePassword = async (req, res, next) => {
    try {
        const { userId, password } = req.body;

        const hashedPassword = await hashString(password);

        const user = await User.findByIdAndUpdate({ _id: userId }, { password: hashedPassword }, { new: true });

        if (user) {
            await PasswordReset.findOneAndDelete({ userId });

            res.status(200).json({
                status: 'SUCCESS',
                message: 'Mật khẩu đã được thay đổi'
            });
        }
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
};

const getUser = async (req, res, next) => {
    try {
        const { userId } = req.body.user;
        const { id } = req.params;

        const user = await User.findById(id ?? userId)
            .populate({
                path: 'friends',
                select: '-password',
            })
            .populate({
                path: 'faculty',
                select: 'name',
            })
            .populate({
                path: 'major',
                select: 'majorName academicYear',
            });

        if (!user) {
            return res.status(404).json({
                status: 'FAILED',
                message: 'Không tìm thấy người dùng'
            });
        }

        res.status(200).json({
            status: 'SUCCESS',
            user: user,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Lỗi xác thực!',
            status: 'FAILED',
            error: error.message
        });
    }
};

const updateUser = async (req, res, next) => {
    const { userId } = req.params;
    try {
        const {
            firstName,
            lastName,
            student_id,
            faculty,
            major,
            gender,
            dateOfBirth,
            bio,
            facebook,
            linkedin,
            github,
        } = req.body;

        const updateFields = {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(student_id && { student_id }),
            ...(faculty && { faculty }),
            ...(major && { major }),
            ...(gender && { gender }),
            ...(dateOfBirth && { dateOfBirth }),
            ...(bio && { bio }),
            ...(facebook && { facebook }),
            ...(linkedin && { linkedin }),
            ...(github && { github }),
        };

        if (req.files && req.files.avatar) {
            updateFields.avatar = req.files.avatar[0].path; // sử dụng path từ file đã upload
        }

        // Update the user in the database
        const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true })
            .populate({
                path: 'faculty',
                select: 'name',
            })
            .populate({
                path: 'major',
                select: 'majorName academicYear',
            })
            .populate({
                path: 'friends',
                select: '-password',
            })
            .populate({
                path: 'notifications'
            });

        // Handle case where the user does not exist
        if (!updatedUser) {
            return res.status(404).json({ status: 'FAILED', message: 'Không tìm thấy người dùng' });
        }

        // Respond with the updated user
        res.status(200).json({
            status: 'SUCCESS',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ status: 'FAILED', message: 'Lỗi máy chủ' });
    }
};

const friendRequest = async (req, res, next) => {
    try {
        const { userId } = req.body.user;
        const { requestTo } = req.body;

        const requestExist = await FriendRequest.findOne({
            requestFrom: userId,
            requestTo,
        });

        if (requestExist) {
            return res.status(400).json({
                status: 'FAILED',
                message: 'Yêu cầu đã được gửi'
            });
        }

        const accountExist = await FriendRequest.findOne({
            requestFrom: requestTo,
            requestTo: userId,
        });

        if (accountExist) {
            return res.status(400).json({
                status: 'FAILED',
                message: 'Yêu cầu đã được gửi'
            });
        }

        const newRequest = new FriendRequest({
            requestTo,
            requestFrom: userId,
        });

        await newRequest.save();

        res.status(201).json({
            status: 'SUCCESS',
            message: 'Gửi yêu cầu kết bạn thành công'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const createGroupRequest = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { name, description } = req.body;

        const lastRequest = await GroupRequest.findOne({ userId }).sort({ createdAt: -1 });

        if (lastRequest) {
            const timeDifference = Date.now() - new Date(lastRequest.createdAt).getTime();
            const coolDownPeriod = 24 * 60 * 60 * 1000;

            if (timeDifference < coolDownPeriod) {
                return res.status(400).json({
                    message: 'Bạn chỉ có thể gửi yêu cầu mở nhóm một lần trong 24 giờ'
                });
            }
        }

        const newGroupRequest = new GroupRequest({ userId, name, description });

        await newGroupRequest.save();

        res.status(201).json({
            message: 'Yêu cầu mở nhóm đã được gửi thành công',
            groupRequest: newGroupRequest
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Lỗi tạo yêu cầu mở nhóm', error: error.message });
    }
};

const getFriendRequests = async (req, res) => {
    try {
        const { userId } = req.body.user;

        const requests = await FriendRequest.find({
            requestTo: userId,
            requestStatus: 'PENDING',
        })
            .populate({
                path: 'requestFrom',
                select: '-password'
            })
            .limit(10)
            .sort({
                _id: -1,
            })

        res.status(200).json({
            status: 'SUCCESS',
            requests
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const getUserFriendRequests = async (req, res) => {
    const { userId } = req.params;
    try {
        const requests = await FriendRequest.find({
            requestTo: userId,
            requestStatus: 'PENDING',
        })
            .populate({
                path: 'requestFrom',
                select: '-password'
            })
            .populate({
                path: 'requestTo',
                select: '-password'
            })
            .limit(10)
            .sort({
                _id: -1,
            })

        res.status(200).json({
            status: 'SUCCESS',
            requests
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

const acceptRequest = async (req, res, next) => {
    try {
        const { userId } = req.body.user;
        const { requestId, status } = req.body;

        const requestExist = await FriendRequest.findById(requestId);

        if (!requestExist) {
            return res.status(404).json({
                status: 'FAILED',
                message: 'Yêu cầu không tồn tại'
            });
        }

        const newRequest = await FriendRequest.findByIdAndUpdate(
            { _id: requestId },
            { requestStatus: status },
        );

        let updatedUser;
        let updatedFriend;
        if (status === 'ACCEPTED') {
            const user = await User.findById(userId).populate('faculty').populate('major').populate({
                path: 'friends',
                select: '-password',
            });
            const friend = await User.findById(newRequest?.requestFrom);

            user.friends.push(newRequest?.requestFrom);
            user.following.push(friend);
            user.followers.push(friend);

            friend.friends.push(newRequest?.requestTo);
            friend.following.push(user);
            friend.followers.push(user);

            updatedFriend = await friend.save();
            updatedUser = await user.save();
        }

        res.status(200).json({
            status: 'SUCCESS',
            message: 'Yêu cầu đã được xác nhận',
            user: updatedUser,
            friend: updatedFriend,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const cancelRequest = async (req, res, next) => {
    try {
        const { userId } = req.body.user;

        const requestExist = await FriendRequest.findOne({
            requestFrom: userId,
        });

        if (!requestExist) {
            return res.status(404).json({
                status: 'FAILED',
                message: 'Yêu cầu không tồn tại hoặc bạn không có quyền hủy yêu cầu này'
            });
        }

        await FriendRequest.findByIdAndDelete(requestExist._id);

        res.status(200).json({
            status: 'SUCCESS',
            message: 'Yêu cầu đã bị hủy'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const rejectRequest = async (req, res, next) => {
    try {
        const { requestId } = req.body;

        const requestExist = await FriendRequest.findById(requestId);

        if (!requestExist) {
            return res.status(404).json({
                status: 'FAILED',
                message: 'Yêu cầu không tồn tại'
            });
        }

        await FriendRequest.findByIdAndUpdate(
            { _id: requestId },
            { requestStatus: 'REJECTED' },
        );

        res.status(200).json({
            status: 'SUCCESS',
            message: 'Yêu cầu đã bị từ chối'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const unFriend = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { friendId } = req.body;

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ status: 'FAILED', message: 'Người dùng không tồn tại' });
        }

        if (!user.friends.includes(friendId)) {
            return res.status(400).json({ status: 'FAILED', message: 'Bạn không có người bạn này' });
        }

        const userIndex = user.friends.indexOf(friendId);
        const userFollowerIndex = user.followers.indexOf(friendId);
        const userFollowingIndex = user.following.indexOf(friendId);
        user.friends.splice(userIndex, 1);
        user.followers.splice(userFollowerIndex, 1);
        user.following.splice(userFollowingIndex, 1);
        await user.save();

        const friendIndex = friend.friends.indexOf(userId);
        const friendFollowerIndex = friend.followers.indexOf(userId);
        const friendFollowingIndex = friend.following.indexOf(userId);

        friend.followers.splice(friendFollowerIndex, 1);
        friend.following.splice(friendFollowingIndex, 1);
        friend.friends.splice(friendIndex, 1);
        await friend.save();

        const updatedUser = await User.findById(userId).populate('faculty').populate('major').populate({
            path: 'friends',
            select: '-password',
        });

        res.status(200).json({ status: 'SUCCESS', message: 'Hủy kết bạn thành công', user: updatedUser });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const followUser = async (req, res) => {
    try {
        const { userId, userToFollowId } = req.body;

        const user = await User.findById(userId);
        const userToFollow = await User.findById(userToFollowId);

        if (!user || !userToFollow) {
            return res.status(404).json({ status: 'FAILED', message: 'Người dùng không tồn tại' });
        }


        if (user.following.includes(userToFollowId)) {
            return res.status(400).json({ status: 'FAILED', message: 'User is already following this user' });
        }


        user.following.push(userToFollowId);
        await user.save();


        userToFollow.followers.push(userId);
        await userToFollow.save();

        res.status(200).json({ status: 'SUCCESS', message: 'Theo dõi người dùng thành công' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const unfollowUser = async (req, res) => {
    try {
        const { userId, userToUnfollowId } = req.body;

        const user = await User.findById(userId);
        const userToUnfollow = await User.findById(userToUnfollowId);

        if (!user || !userToUnfollow) {
            return res.status(404).json({ status: 'FAILED', message: 'Người dùng không tồn tại' });
        }

        if (!user.following.includes(userToUnfollowId)) {
            return res.status(400).json({ status: 'FAILED', message: 'Bạn không theo dõi người dùng này' });
        }

        const index = user.following.indexOf(userToUnfollowId);
        user.following.splice(index, 1);
        await user.save();

        const followerIndex = userToUnfollow.followers.indexOf(userId);
        userToUnfollow.followers.splice(followerIndex, 1);
        await userToUnfollow.save();

        res.status(200).json({ status: 'SUCCESS', message: 'Bỏ theo dõi người dùng thành công' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const getFollowers = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).populate('followers', '-password');

        if (!user) {
            return res.status(404).json({ status: 'FAILED', message: 'Người dùng không tồn tại' });
        }

        res.status(200).json({ status: 'SUCCESS', followers: user.followers });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).populate('following', '-password');

        if (!user) {
            return res.status(404).json({ status: 'FAILED', message: 'Người dùng không tồn tại' });
        }

        res.status(200).json({ status: 'SUCCESS', followers: user.following });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const getNotifications = async (req, res) => {
    const { userId } = req.body.user;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 'FAILED', message: 'Người dùng không tồn tại' });
        }

        const notifications = await Notification.find({ receiver: userId })
            .populate({
                path: 'receiver',
                select: '-password',
                populate: {
                    path: 'posts',
                    select: '_id content',
                }
            })
            .populate({
                path: 'sender',
                select: '-password',
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ status: 'SUCCESS', notifications });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const createNotification = async (req, res) => {
    const { receiverIds, sender, type, message, link } = req.body;

    try {
        const receivers = await User.find({ _id: { $in: receiverIds } });
        if (receivers.length === 0) {
            return res.status(404).json({ status: 'FAILED', message: 'Không tìm thấy người dùng nhận thông báo' });
        }

        // Kiểm tra nếu thông báo đã tồn tại cho tất cả người nhận
        const existingNotification = await Notification.findOne({
            receiver: { $all: receiverIds },
            sender,
            type,
            link
        });

        if (existingNotification) {
            return res.status(400).json({ status: 'FAILED', message: 'Thông báo đã tồn tại' });
        }

        const newNotification = new Notification({
            receiver: receiverIds,
            sender,
            type,
            message,
            link,
        });

        await newNotification.save();

        // Thêm thông báo vào danh sách thông báo của từng người dùng nhận
        await Promise.all(receivers.map(async (receiver) => {
            receiver.notifications.push(newNotification._id);
            await receiver.save();
        }));

        // Populate thông báo với thông tin người gửi và người nhận
        const populatedNotification = await Notification.findById(newNotification._id)
            .populate('receiver', '-password')
            .populate('sender', '-password');

        res.status(201).json({ status: 'SUCCESS', message: 'Thông báo đã được tạo', notification: populatedNotification });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const markAsAllRead = async (req, res) => {
    const { userId } = req.body.user;
    try {
        const user = await User.findById(userId).populate('notifications');
        if (!user) {
            return res.status(404).json({ status: 'FAILED', message: 'Người dùng không tồn tại' });
        }

        user.notifications.forEach(async (notification) => {
            notification.isRead = true;
            await notification.save();
        });

        res.status(200).json({ status: 'SUCCESS', message: 'Đánh dấu tất cả đã đọc' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    changePassword,
    getUser,
    updateUser,
    friendRequest,
    createGroupRequest,
    getFriendRequests,
    getUserFriendRequests,
    acceptRequest,
    cancelRequest,
    rejectRequest,
    unFriend,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getNotifications,
    createNotification,
    markAsAllRead,
};