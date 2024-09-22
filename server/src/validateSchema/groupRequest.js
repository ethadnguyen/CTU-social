const Joi = require('joi');

const createGroupRequestValidateSchema = Joi.object({
    name: Joi.string()
        .required()
        .messages({
            'string.empty': 'Tên nhóm không được để trống',
            'string.base': 'name must be a string',
        }),
    description: Joi.string()
        .required()
        .messages({
            'string.empty': 'Mô tả không được để trống',
            'string.base': 'description must be a string',
        }),
    status: Joi.string()
        .valid('PENDING', 'ACCEPTED', 'REJECTED') // Chỉ cho phép các giá trị hợp lệ
        .default('PENDING')
        .messages({
            'string.base': 'status must be a string',
        }),
});

module.exports = {
    createGroupRequestValidateSchema
};
