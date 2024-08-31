const User = require('../models/user.model');
const Faculty = require('../models/faculty.model');
const Major = require('../models/major.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email }).populate('faculty').populate('major');

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu không đúng' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        res.status(200).json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                fullName: user.fullName,
                email: user.email,
                student_id: user.student_id,
                role: user.role,
                faculty: user.faculty.name,
                major: user.major.name
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Đã xảy ra lỗi' });
    }
};

const register = async (req, res) => {
    try {
        const {
            fullName,
            email,
            password,
            student_id,
            facultyName,
            majorName,
            gender,
            phone,
            bio,
            socials,
            avatar
        } = req.body;

        const emailRegex = /^[a-zA-Z0-9._%+-]+@student\.ctu\.edu\.vn$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Chỉ cho phép email @student.ctu.edu.vn' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email đã tồn tại' });
        }

        const faculty = await Faculty.findOne({ name: facultyName });
        if (!faculty) {
            return res.status(400).json({ error: 'Khoa không tồn tại' });
        }
        const major = await Major.findOne({ name: majorName, faculty: faculty._id });
        if (!major) {
            return res.status(400).json({ error: 'Ngành/Chuyên ngành không tồn tại' });
        }
        const newUser = new User({
            fullName,
            email,
            password,
            student_id,
            faculty: faculty._id,
            major: major._id,
            gender,
            phone,
            bio,
            socials,
            avatar
        });

        await newUser.save();

        const token = jwt.sign(
            { userId: newUser._id, role: newUser.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        res.status(201).json({ message: 'Đăng ký thành công!', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Đã xảy ra lỗi!' });
    }
};

module.exports = {
    login,
    register,
};