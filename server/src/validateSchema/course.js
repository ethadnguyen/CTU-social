const Joi = require('joi');

const createCourseSchema = Joi.object({
    course: Joi.string()
        .regex(/^K\d{2}$/)
        .required()
        .messages({
            'string.empty': 'Niên khoá không được để trống',
            'string.pattern.base': 'Niên khoá không hợp lệ (Bắt đầu là K và theo sau là 2 chữ số)',
            'string.base': 'Niên khoá phải là chuỗi',
        }),
});

module.exports = {
    createCourseSchema,
};