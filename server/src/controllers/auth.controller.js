const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const { sendVerificationEmail } = require('../utils/sendMail');
const { createJWT } = require('../utils');

const register = async (req, res) => {
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

        await sendVerificationEmail(newUser, res);

        await newUser.save();

    } catch (error) {
        res.status(500).json({ message: 'Lỗi tạo người dùng', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).populate('faculty').populate('major');
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
    const {
        firstName,
        lastName,
        email,
        password,
        student_id,
        faculty,
        major,
        gender,
        role,
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
            role,
            dateOfBirth,
            phone,
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

const loginAdmin = async (req, res) => {
    try {
        const { email, password, securityCode } = req.body;

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

        if (securityCode !== process.env.SECURITY_CODE) {
            return res.status(400).json({ message: 'Mã bảo mật không đúng' });
        }

        if (user.role !== 'admin') {
            user.role = 'admin';
            await user.save();
        }

        const token = createJWT(user._id, user.role);

        res.status(200).json({
            message: 'Đăng nhập tài khoản quản trị viên thành công',
            token,
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi đăng nhập', error: error.message });
    }
}

module.exports = {
    register,
    login,
    registerAdmin,
    loginAdmin
};