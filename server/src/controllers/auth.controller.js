const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const { sendVerificationEmail } = require('../utils/sendMail');
const { createJWT } = require('../utils');
const Verification = require('../models/emailVerification.model');

const register = async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        password,
        student_id,
        faculty,
        major,
        academicYear,
        gender,
        dateOfBirth,
        phone,
        avatar,
        bio,
        facebook,
        linkedin,
        github
    } = req.body;
    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'Người dùng đã tồn tại' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
        }

        if (dateOfBirth) {
            const date = new Date(dateOfBirth);
            const currentDate = new Date();
            const age = currentDate.getFullYear() - date.getFullYear();
            if (age < 18) {
                return res.status(400).json({ message: 'Tuổi phải lớn hơn hoặc bằng 18' });
            }
        }

        if (student_id) {
            const existingStudentId = await User.findOne({ student_id });

            if (existingStudentId) {
                return res.status(400).json({ message: 'Mã số sinh viên đã tồn tại' });
            }
        }

        const newUser = new User({
            firstName,
            lastName,
            email,
            password,
            student_id,
            faculty,
            major,
            academicYear,
            gender,
            dateOfBirth,
            avatar,
            bio,
            facebook,
            linkedin,
            github
        });

        await sendVerificationEmail(newUser, res);

        await newUser.save();

    } catch (error) {
        res.status(500).json({ message: 'Lỗi tạo người dùng', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email })
            .populate('faculty')
            .populate('major')
            .populate({
                path: 'friends',
                select: '-password'
            })
            .populate({
                path: 'notifications'
            })
            .populate({
                path: 'groups'
            });

        if (!user) {
            return res.status(400).json({ message: 'Người dùng không tồn tại' });
        }

        if (!user?.isVerified) {
            return res.status(400).json({ message: 'Email chưa xác thực' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Mật khẩu không đúng' });
        }

        if (!user?.isVerified) {
            return res.status(400).json({ message: 'Email chưa xác thực' });
        }


        const token = createJWT(user._id);

        res.status(200).json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                ...user._doc,
                password: '',
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi đăng nhập', error: error.message });
    }
};

const registerAdmin = async (req, res) => {
    try {
        const { email, password, securityCode } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Người dùng không tồn tại' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ message: 'Email chưa xác thực' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Mật khẩu không đúng' });
        }

        const otpRecord = await Verification.findOne({ token: securityCode, userId: user._id });
        if (!otpRecord || Date.now() > otpRecord.expiresAt) {
            return res.status(400).json({ message: 'OTP không tồn tại hoặc đã hết hạn' });
        }

        if (otpRecord.token !== securityCode) {
            return res.status(400).json({ message: 'Mã OTP không hợp lệ' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Tài khoản đã là quản trị viên' });
        }
        else {
            user.role = 'admin';
            await user.save();
            await Verification.deleteOne({ token: securityCode, userId: user._id });
        }


        res.status(201).json({
            status: 'success',
            message: 'Đăng ký tài khoản quản trị viên thành công',
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi đăng ký', error: error.message });
    }
};

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email })
            .populate('faculty')
            .populate('major')
            .populate({
                path: 'friends',
                select: '-password'
            })
            .populate({
                path: 'notifications'
            })
            .populate({
                path: 'groups'
            });

        if (!user) {
            return res.status(400).json({ message: 'Người dùng không tồn tại' });
        }

        if (!user?.isVerified) {
            return res.status(400).json({ message: 'Email chưa xác thực' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Mật khẩu không đúng' });
        }

        if (user.role !== 'admin') {
            return res.status(400).json({ message: 'Bạn chưa có quyền quản trị, vui lòng kích hoạt' });
        }

        const token = createJWT(user._id, user.role);

        res.status(200).json({
            message: 'Đăng nhập tài khoản quản trị viên thành công',
            token,
            user: {
                ...user._doc,
                password: '',
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi đăng nhập', error: error.message });
    }
};

module.exports = {
    register,
    login,
    registerAdmin,
    loginAdmin
};