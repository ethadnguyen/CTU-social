const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { hashString } = require('./index.js');
const uuidv4 = require('uuid').v4;
const Verification = require('../models/emailVerification.model.js');

dotenv.config();

const { AUTH_EMAIL, AUTH_PASSWORD, APP_URL } = process.env;

let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    auth: {
        user: AUTH_EMAIL,
        pass: AUTH_PASSWORD,
    },
});


const sendVerificationEmail = async (user, res, next) => {
    const { _id, email, firstName } = user;

    const token = _id + uuidv4();

    const link = APP_URL + 'users/verify/' + _id + '/' + token;

    const mailOptions = {
        from: AUTH_EMAIL,
        to: email,
        subject: 'Xác thực tài khoản',
        html: `<div
        style='font-family: Arial, sans-serif; font-size: 20px; color: #333; background-color: #f7f7f7; padding: 20px; border-radius: 5px;'>
        <h3 style="color: rgb(8, 56, 188)">Please verify your email address</h3>
        <hr>
        <h4>Hi ${firstName},</h4>
        <p>
            Xin hãy xác thực để chúng tôi biết bạn là ai ^^
            <br>
        <p>liên kết này sẽ <b>hết hạn trong 1 giờ</b></p>
        <br>
        <a href=${link}
            style="color: #fff; padding: 14px; text-decoration: none; background-color: #000;  border-radius: 8px; font-size: 18px;">Xác thực email</a>
        </p>
        <div style="margin-top: 20px;">
            <h5>Thân ái!</h5>
            <h5>CTU Social</h5>
        </div>
    </div>`,
    };

    try {
        const hashedToken = await hashString(token);

        const newVerifiedEmail = await Verification.create({
            userId: _id,
            token: hashedToken,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000,
        });

        if (newVerifiedEmail) {
            transporter
                .sendMail(mailOptions)
                .then(() => {
                    res.status(201).send({
                        success: 'PENDING',
                        message: 'Email xác thực đã được gửi. Kiểm tra hộp thư của bạn',
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(404).json({ message: 'Lỗi gửi email xác thực', error: err.message });
                });
        }
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: 'Lỗi tạo xác thực email', error: error.message });
    }
};

const resetPasswordLink = async (user, res) => {
    const { _id, email } = user;

    const token = _id + uuidv4();
    const link = APP_URL + 'users/reset-password/' + _id + '/' + token;

    const mailOptions = {
        from: AUTH_EMAIL,
        to: email,
        subject: 'Đặt lại mật khẩu',
        html: `<p style="font-family: Arial, sans-serif; font-size: 16px; color: #333; background-color: #f7f7f7; padding: 20px; border-radius: 5px;">
            Liên kết đặt lại mật khẩu. Vui lòng nhấn vào liên kết bên dưới để đặt lại mật khẩu.
            <br>
            <p style="font-size: 18px;"><b>Liên kết này sẽ hết hạn trong 10 phút</b></p>
            <br>
            <a href=${link} style="color: #fff; padding: 10px; text-decoration: none; background-color: #000;  border-radius: 8px; font-size: 18px; ">Đặt lại mật khẩu</a>.
        </p>`,
    };

    try {
        const hashedToken = hashString(token);

        const resetEmail = await Verification.create({
            userId: _id,
            token: hashedToken,
            createdAt: Date.now(),
            expiresAt: Date.now() + 600000,
        });

        if (resetEmail) {
            transporter
                .sendMail(mailOptions)
                .then(() => {
                    res.status(201).send({
                        success: 'PENDING',
                        message: 'Email đặt lại mật khẩu đã được gửi. Kiểm tra hộp thư của bạn',
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(404).json({ message: 'Lỗi gửi email đặt lại mật khẩu', error: err.message });
                });
        }
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: 'Lỗi tạo xác thực email', error: error.message });
    }
};

module.exports = { sendVerificationEmail, resetPasswordLink };