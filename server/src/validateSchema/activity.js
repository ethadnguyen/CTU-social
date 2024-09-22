const Joi = require('joi');

const createActivitySchema = Joi.object({
    title: Joi.string()
        .min(3)
        .required()
        .messages({
            'string.empty': 'Tiêu đề không được để trống',
            'string.base': 'Tiêu đề phải là chuỗi',
            'string.min': 'Tiêu đề phải ít nhất 3 ký tự',
        }),
    description: Joi.string()
        .optional()
        .messages({
            'string.base': 'Mô tả phải là chuỗi',
        }),
    link: Joi.string()
        .optional()
        .messages({
            'string.base': 'Link phải là chuỗi',
        }),
    faculty: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages({
            'string.empty': 'Khoa không được để trống',
            'string.pattern.base': 'Khoa phải là ObjectId',
        }),
});

module.exports = {
    createActivitySchema
};
