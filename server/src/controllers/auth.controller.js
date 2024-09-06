const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { validationResult } = require('express-validator');
const { sendVerificationEmail } = require('../utils/sendMail');

const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {
        firstName,
        lastName,
        email,
        password,
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
    } = req.body;
    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'Người dùng đã tồn tại' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
        }

        const newUser = new User({
            firstName,
            lastName,
            email,
            password,
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
        });

        // const access_token = createAccessToken({ id: newUser._id });
        // const refresh_token = createRefreshToken({ id: newUser._id });

        // res.cookie('refresh_token', refresh_token, {
        //     httpOnly: true,
        //     path: '/api/refresh_token',
        //     maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        // });
        await newUser.save();

        sendVerificationEmail(newUser, res);

        // res.status(200).json({
        //     message: 'Tạo người dùng thành công',
        //     access_token,
        //     user: {
        //         ...newUser._doc,
        //         password: '',
        //     },
        // });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tạo người dùng', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
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


        const access_token = createAccessToken({ id: user._id });
        const refresh_token = createRefreshToken({ id: user._id });

        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            path: '/api/refresh_token',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });


        res.status(200).json({
            message: 'Đăng nhập thành công',
            access_token,
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

const generateAccessToken = async (req, res) => {
    try {
        const refresh_token = req.cookies.refresh_token;
        if (!refresh_token)
            return res.status(400).json({ message: 'Vui lòng đăng nhập' });

        jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET,
            async (err, result) => {
                if (err) {
                    return res.status(400).json({ message: 'Vui lòng đăng nhập' });
                }

                const user = await User.findById(result.id)
                    .select(-password)
                    .populate('followers following', '-password');

                if (!user) {
                    return res.status(400).json({ message: 'Người dùng không tồn tại' });
                }

                const access_token = createAccessToken({ id: result.id });
                res.json({
                    access_token,
                    user
                });
            }
        );
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi tạo access token', error: error.message });
    }
}

const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
};

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

module.exports = {
    register,
    login,
};