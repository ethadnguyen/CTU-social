const Verification = require('../models/emailVerification.model');
const User = require('../models/user.model');
const { compareString, hashString } = require('../utils/index');
const { resetPasswordLink } = require('../utils/sendMail');
const friendRequest = require('../models/friendRequest.model');
const PasswordReset = require('../models/PasswordReset.model');

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

module.exports = {
    verifyEmail
};