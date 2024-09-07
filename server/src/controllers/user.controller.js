const Verification = require('../models/emailVerification.model');
const User = require('../models/user.model');
const { compareString, hashString } = require('../utils/index');
const { resetPasswordLink } = require('../utils/sendMail');
const friendRequest = require('../models/friendRequest.model');
const PasswordReset = require('../models/PasswordReset.model');
const FriendRequest = require('../models/friendRequest.model');

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
            res.redirect(`/users/reset-password?status=error&message=${message}`);
        }

        const resetPassword = await PasswordReset.findOne({ userId });

        if (!resetPassword) {
            const message = 'Liên kết không hợp lệ. Thử lại';
            res.redirect(`/users/reset-password?status=error&message=${message}`);
        }

        const { expiresAt, token: resetToken } = resetPassword;

        if (expiresAt < Date.now()) {
            const message = 'Liên kết đã hết hạn. Thử lại';
            res.redirect(`/users/reset-password?status=error&message=${message}`);
        } else {
            const isMatch = await compareString(token, resetToken);

            if (!isMatch) {
                const message = 'Liên kết không hợp lệ. Thử lại';
                res.redirect(`/users/reset-password?status=error&message=${message}`);
            } else {
                res.redirect(`/users/reset-password?type=reset&id=${userId}`);
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

        const user = await User.findByIdAndUpdate({ _id: userId, password });

        if (!user) {
            return res.status(404).json({ status: 'FAILED', message: 'Không tìm thấy người dùng' });
        }

        res.status(200).json({
            status: 'SUCCESS',
            message: 'Mật khẩu đã được thay đổi',
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
};

const getUser = async (req, res, next) => {
    try {
        const { userId } = req.body.user;
        const { id } = req.params;

        const user = await User.findById(id ?? userId).populate({
            path: 'friends',
            select: '-password',
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
    try {
        const { userId } = req.params;
        const {
            firstName,
            lastName,
            student_id,
            faculty,
            major,
            gender,
            dateOfBirth,
            phone,
            avatar,
            bio,
            facebook,
            linkedin,
            github } = req.body;

        const updateUser = {
            _id: userId,
            firstName,
            lastName,
            student_id,
            faculty,
            major,
            gender,
            dateOfBirth,
            phone,
            avatar,
            bio,
            facebook,
            linkedin,
            github
        };

        const updatedUser = await User.findByIdAndUpdate(userId, updateUser, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ status: 'FAILED', message: 'Không tìm thấy người dùng' });
        }

        res.status(200).json({
            status: 'SUCCESS',
            user: updatedUser,
        });
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

        res.status(201).json({
            status: 'SUCCESS',
            message: 'Gửi yêu cầu kết bạn thành công'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const getFriendRequest = async (req, res) => {
    try {
        const { userId } = req.body.user;

        const request = await FriendRequest.find({
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
            request
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

const acceptRequest = async (req, res, next) => {
    try {
        const id = req.body.user.userId;

        const { requestId, status } = req.body;

        const requestExist = await FriendRequest.findById({ requestId });

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
        if (status === 'ACCEPTED') {
            const user = await User.findById(id);

            user.friends.push(newRequest?.requestFrom);

            await user.save();

            const friend = await User.findById(newRequest?.requestFrom);

            friend.friends.push(newRequest?.requestTo);

            await friend.save();
        }

        res.status(200).json({
            status: 'SUCCESS',
            message: 'Yêu cầu đã được xác nhận'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}


module.exports = {
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    changePassword,
    getUser,
    updateUser,
    friendRequest,
    getFriendRequest,
    acceptRequest
};