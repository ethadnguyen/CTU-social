const Joi = require('joi');

const createUserSchema = Joi.object({
    firstName: Joi.string()
        .required()
        .messages({
            'string.empty': 'Tên không được để trống',
            'string.base': 'Tên phải là chuỗi',
        }),
    lastName: Joi.string()
        .required()
        .messages({
            'string.empty': 'Họ và tên lót không được để trống',
            'string.base': 'Họ và tên lót phải là chuỗi',
        }),
    email: Joi.string()
        .email()
        .required()
        .regex(/@student\.ctu\.edu\.vn$/)
        .messages({
            'string.empty': 'Email không được để trống',
            'string.email': 'Email phải là chuỗi',
            'string.pattern.base': 'Email phải có định dạng @student.ctu.edu.vn',
        }),
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.empty': 'Mật khẩu không được để trống',
            'string.min': 'Mật khẩu phải ít nhất 6 ký tự',
            'string.base': 'Mật khẩu phải là chuỗi',
        }),
    student_id: Joi.string()
        .required()
        .messages({
            'string.empty': 'Mã số sinh viên không được để trống',
            'string.base': 'Mã số sinh viên phải là chuỗi',
        }),
    role: Joi.string()
        .valid('user', 'admin')
        .default('user')
        .optional()
        .messages({
            'any.only': 'Vai trò phải là "user" hoặc "admin"',
        }),
    avatar: Joi.string()
        .optional()
        .messages({
            'string.base': 'Ảnh đại diện phải là chuỗi',
        }),
    gender: Joi.string()
        .valid('Male', 'Female', 'Other')
        .default('Male')
        .optional()
        .messages({
            'any.only': 'Giới tính phải là "Male", "Female" hoặc "Other"',
        }),
    phone: Joi.string()
        .optional()
        .pattern(/^\d{10,15}$/)
        .messages({
            'string.base': 'Số điện thoại phải là chuỗi',
            'string.pattern.base': 'Số điện thoại không hợp lệ',
        }),
    dateOfBirth: Joi.date()
        .optional()
        .messages({
            'date.base': 'Ngày sinh không hợp lệ',
        }),
    bio: Joi.string()
        .optional()
        .messages({
            'string.base': 'Tiểu sử phải là chuỗi',
        }),
    faculty: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.empty': 'Khoa không được để trống',
            'string.pattern.base': 'Khoa phải là một ObjectId hợp lệ',
        }),
    major: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.empty': 'Ngành không được để trống',
            'string.pattern.base': 'Ngành phải là một ObjectId hợp lệ',
        }),
    facebook: Joi.string()
        .uri()
        .optional()
        .messages({
            'string.base': 'Liên kết facebook phải là chuỗi',
            'string.uri': 'Liên kết facebook phải là một URL hợp lệ',
        }),
    linkedin: Joi.string()
        .uri()
        .optional()
        .messages({
            'string.base': 'Liên kết linkedin phải là chuỗi',
            'string.uri': 'Liên kết linkedin phải là một URL hợp lệ',
        }),
    github: Joi.string()
        .uri()
        .optional()
        .messages({
            'string.base': 'Liên kết github phải là chuỗi',
            'string.uri': 'Liên kết github phải là một URL hợp lệ',
        }),
});

module.exports = {
    createUserSchema,
};
