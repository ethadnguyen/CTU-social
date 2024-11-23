const Verification = require('../models/emailVerification.model');
const User = require('../models/user.model');
const { compareString, hashString } = require('../utils/index');
const { resetPasswordLink } = require('../utils/sendMail');
const FriendRequest = require('../models/friendRequest.model');
const PasswordReset = require('../models/PasswordReset.model');
const GroupRequest = require('../models/groupRequest.model');
const Notification = require('../models/notification.model');
const tagModel = require('../models/tag.model');
const userModel = require('../models/user.model');

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
            })
            .populate({
                path: 'notifications'
            })
            .populate({
                path: 'groups',
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

const getUsersByQuery = async (req, res) => {
    const { search } = req.query;
    try {

        if (!search) {
            return res.status(200).json({ status: 'SUCCESS', users: [] });
        }

        const users = await userModel.find({
            $or: [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { student_id: { $regex: search, $options: 'i' } },
                {
                    $expr: {
                        $regexMatch: {
                            input: { $concat: ["$firstName", " ", "$lastName"] },
                            regex: search,
                            options: "i"
                        }
                    }
                },
                {
                    $expr: {
                        $regexMatch: {
                            input: { $concat: ["$lastName", " ", "$firstName"] },
                            regex: search,
                            options: "i"
                        }
                    }
                }
            ]
        })
            .populate({ path: 'faculty', select: 'name' })
            .populate({ path: 'major', select: 'majorName academicYear' })
            .populate({ path: 'friends', select: '-password' })
            .populate({ path: 'notifications' })
            .populate({ path: 'groups' });

        res.status(200).json({ status: 'SUCCESS', users });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
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
            academicYear,
            gender,
            dateOfBirth,
            bio,
            facebook,
            linkedin,
            github,
            privacy
        } = req.body;

        if (dateOfBirth) {
            const date = new Date(dateOfBirth);
            const currentDate = new Date();
            const age = currentDate.getFullYear() - date.getFullYear();
            if (age < 18) {
                return res.status(400).json({ message: 'Tuổi phải lớn hơn hoặc bằng 18' });
            }
        }

        const updateFields = {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(student_id && { student_id }),
            ...(faculty && { faculty }),
            ...(major && { major }),
            ...(academicYear && { academicYear }),
            ...(gender && { gender }),
            ...(dateOfBirth && { dateOfBirth }),
            ...(bio && { bio }),
            ...(facebook && { facebook }),
            ...(linkedin && { linkedin }),
            ...(github && { github }),
            ...(privacy && { privacy }),
        };

        if (req.files && req.files.avatar) {
            updateFields.avatar = req.files.avatar[0].path;
        }

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
            })
            .populate({
                path: 'groups',
            });

        if (!updatedUser) {
            return res.status(404).json({ status: 'FAILED', message: 'Không tìm thấy người dùng' });
        }

        res.status(200).json({
            status: 'SUCCESS',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ status: 'FAILED', message: 'Lỗi máy chủ' });
    }
};

const getSuggestedFriends = async (req, res) => {
    try {
        const { userId } = req.body.user;

        const user = await User.findById(userId).populate('faculty').populate('major').populate('friends');
        if (!user) {
            return res.status(404).json({ status: 'FAILED', message: 'Người dùng không tồn tại' });
        }

        const friendRequests = await FriendRequest.find({
            $or: [
                { requestFrom: userId },
                { requestTo: userId }
            ]
        });

        const requestedUserIds = friendRequests.map(request =>
            request.requestFrom.toString() === userId ? request.requestTo.toString() : request.requestFrom.toString()
        );

        const suggestedFriends = await User.find({
            $or: [
                { faculty: user.faculty._id },
                { major: user.major._id }
            ],
            _id: { $ne: userId, $nin: [...user.friends, ...requestedUserIds] }
        })
            .limit(5)
            .populate('faculty', 'name')
            .populate('major', 'majorName academicYear')
            .populate('friends', '-password')
            .populate('notifications')
            .populate('groups');

        res.status(200).json({ status: 'SUCCESS', users: suggestedFriends });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
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

        const updatedUser = await User.findById(userId)
            .populate('faculty')
            .populate('major')
            .populate({
                path: 'friends',
                select: '-password',
            });

        const populatedRequest = await FriendRequest.findById(newRequest._id)
            .populate('requestTo', '-password')
            .populate('requestFrom', '-password');

        res.status(201).json({
            status: 'SUCCESS',
            message: 'Gửi yêu cầu kết bạn thành công',
            user: updatedUser,
            request: populatedRequest,
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
        const user = await userModel.findById(userId);

        const newGroupRequest = new GroupRequest({ user, name, description });

        await newGroupRequest.save();

        const populatedRequest = await GroupRequest.findById(newGroupRequest._id).populate('user', '-password');

        res.status(201).json({
            message: 'Yêu cầu mở nhóm đã được gửi thành công',
            groupRequest: populatedRequest,
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

        const updatedUser = await User.findById(userId)
            .populate('faculty')
            .populate('major')
            .populate({
                path: 'friends',
                select: '-password',
            });

        res.status(200).json({
            status: 'SUCCESS',
            message: 'Yêu cầu đã bị hủy',
            user: updatedUser
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

        await FriendRequest.findByIdAndDelete(requestId);

        res.status(200).json({
            status: 'SUCCESS',
            message: 'Yêu cầu đã bị từ chối và đã bị xóa'
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

        await FriendRequest.findOneAndDelete({
            $or: [
                { requestFrom: userId, requestTo: friendId },
                { requestFrom: friendId, requestTo: userId }
            ]
        });

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
    const { userToFollowId } = req.body;
    const { userId } = req.body.user;
    try {
        const user = await userModel.findById(userId);
        const userToFollow = await userModel.findById(userToFollowId);

        if (!user || !userToFollow) {
            return res.status(404).json({ status: 'FAILED', message: 'Người dùng không tồn tại' });
        }

        if (user.following.includes(userToFollowId)) {
            return res.status(400).json({ status: 'FAILED', message: 'Bạn đã theo dõi người dùng này' });
        }

        user.following.push(userToFollowId);
        await user.save();

        userToFollow.followers.push(userId);
        await userToFollow.save();

        const updatedUser = await userModel.findById(userId)
            .populate('faculty')
            .populate('major')
            .populate({
                path: 'friends',
                select: '-password',
            })
            .populate({
                path: 'notifications'
            })
            .populate({
                path: 'groups',
            });

        res.status(200).json({ status: 'SUCCESS', message: 'Theo dõi người dùng thành công', user: updatedUser });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const unfollowUser = async (req, res) => {
    const { userId } = req.body.user;
    const { userToUnfollowId } = req.body;
    try {

        const user = await userModel.findById(userId);
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

        const updatedUser = await userModel.findById(userId)
            .populate('faculty')
            .populate('major')
            .populate({
                path: 'friends',
                select: '-password',
            })
            .populate({
                path: 'notifications'
            })
            .populate({
                path: 'groups',
            });

        res.status(200).json({ status: 'SUCCESS', message: 'Bỏ theo dõi người dùng thành công', user: updatedUser });
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

        let existingNotification;
        if (type === 'like') {
            existingNotification = await Notification.findOne({
                receiver: { $all: receiverIds },
                sender,
                type,
                link
            });
        }

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

        const updatedNotifications = await Promise.all(user.notifications.map(async (notification) => {
            notification.isRead = true;
            await notification.save();
            return Notification.findById(notification._id).populate('sender', '-password').populate('receiver', '-password');
        }));

        updatedNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json({ status: 'SUCCESS', message: 'Marked all as read', notifications: updatedNotifications });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const markAsRead = async (req, res) => {
    const { userId } = req.body.user;
    const { notificationId } = req.params;

    try {
        const user = await User.findById(userId).populate('notifications');
        if (!user) {
            return res.status(404).json({ status: 'FAILED', message: 'Người dùng không tồn tại' });
        }

        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ status: 'FAILED', message: 'Thông báo không tồn tại' });
        }

        notification.isRead = true;
        await notification.save();

        const updatedNotification = await Notification.findById(notificationId).populate('sender', '-password').populate('receiver', '-password');

        res.status(200).json({ status: 'SUCCESS', message: 'Marked as read', notification: updatedNotification });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const createTag = async (req, res) => {
    const { userId } = req.body.user;
    const { name } = req.body;
    try {

        const tag = new tagModel({ name });
        await tag.save();

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 'FAILED', message: 'Người dùng không tồn tại' });
        }
        user.tags.push(tag);
        await user.save();
        res.status(200).json({ status: 'SUCCESS', message: 'Tạo thẻ thành công', user, tag });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const getTags = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId).populate('tags');
        if (!user) {
            return res.status(404).json({ status: 'FAILED', message: 'Người dùng không tồn tại' });
        }
        res.status(200).json({ status: 'SUCCESS', tags: user.tags });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const deleteTag = async (req, res) => {
    const { userId } = req.body.user;
    const { tagId } = req.params;
    try {
        const user = await User.findById(userId).populate('tags');
        if (!user) {
            return res.status(404).json({ status: 'FAILED', message: 'Người dùng không tồn tại' });
        }

        const tag = await tagModel.findById(tagId);
        if (!tag) {
            return res.status(404).json({ status: 'FAILED', message: 'Thẻ không tồn tại' });
        }

        const index = user.tags.indexOf(tagId);
        user.tags.splice(index, 1);
        await user.save();
        await tagModel.findByIdAndDelete(tagId);
        res.status(200).json({ status: 'SUCCESS', message: 'Xóa thẻ thành công', user });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const uploadFileToTag = async (req, res) => {
    const { tagId } = req.params;

    try {
        const tag = await tagModel.findById(tagId);
        if (!tag) {
            return res.status(404).json({ status: 'FAILED', message: 'Thẻ không tồn tại' });
        }

        const uploadedFiles = req.files.map((file) => ({
            id: Math.floor(Math.random() * 1000),
            name: file.originalname,
            url: file.path,
            uploadedAt: new Date(),
        }));

        tag.files.push(...uploadedFiles);

        await tag.save();

        res.status(200).json({ status: 'SUCCESS', message: 'Tải lên tệp thành công', tag, files: uploadedFiles });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const deleteFileFromTag = async (req, res) => {
    const { tagId, fileId } = req.params;

    try {
        const tag = await tagModel.findById(tagId);
        if (!tag) {
            return res.status(404).json({ status: 'FAILED', message: 'Thẻ không tồn tại' });
        }

        const fileIndex = tag.files.findIndex((file) => file.id.toString() === fileId);
        console.log('fileIndex', fileIndex);
        if (fileIndex === -1) {
            return res.status(404).json({ status: 'FAILED', message: 'Tệp không tồn tại' });
        }

        tag.files.splice(fileIndex, 1);
        await tag.save();

        res.status(200).json({ status: 'SUCCESS', message: 'Xóa tệp thành công', tag });
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
    getUsersByQuery,
    updateUser,
    friendRequest,
    createGroupRequest,
    getSuggestedFriends,
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
    markAsRead,
    createTag,
    getTags,
    deleteTag,
    uploadFileToTag,
    deleteFileFromTag
};