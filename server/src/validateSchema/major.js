const Joi = require('joi');

const createMajorSchema = Joi.object({
    majorName: Joi.string()
        .min(3)
        .required()
        .messages({
            'string.empty': 'Tên ngành không được để trống',
            'string.min': 'Tên ngành phải ít nhất 3 ký tự',
            'string.base': 'Tên ngành phải là chuỗi',
        }),
    faculty: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.empty': 'Khoa không được để trống',
            'string.pattern.base': 'Khoa phải là một ObjectId hợp lệ',
        }),
});

module.exports = {
    createMajorSchema,
};
