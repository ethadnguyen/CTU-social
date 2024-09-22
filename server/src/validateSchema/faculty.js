const Joi = require('joi');

const createFacultySchema = Joi.object({
    name: Joi.string()
        .min(3)
        .required()
        .messages({
            'string.base': 'Tên khoa phải là chuỗi',
            'string.empty': 'Tên khoa không được để trống',
            'string.min': 'Tên khoa phải ít nhất 3 ký tự',
        })
});

module.exports = {
    createFacultySchema
};