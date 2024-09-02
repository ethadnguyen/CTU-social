const { body } = require('express-validator');

const validateUserSchema = [
    body('firstName')
        .notEmpty()
        .withMessage('Họ không được để trống'),
    body('lastName')
        .notEmpty()
        .withMessage('Tên không được để trống'),
    body('email')
        .isEmail()
        .withMessage('Email không hợp lệ')
        .custom((value) => {
            if (!value.endsWith('@student.ctu.edu.vn')) {
                throw new Error('Email phải là mail sinh viên (@student.ctu.edu.vn)');
            }
            return true;
        }),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu phải ít nhất 6 ký tự'),
    body('student_id')
        .notEmpty()
        .withMessage('Mã số sinh viên không được để trống'),
    body('faculty')
        .notEmpty()
        .withMessage('Khoa không được để trống'),
    body('major')
        .notEmpty()
        .withMessage('Ngành không được để trống'),
    body('phone')
        .optional({ nullable: true })
        .isMobilePhone('vi-VN', { strictMode: true })
        .withMessage('Số điện thoại không hợp lệ')
];

module.exports = validateUserSchema;