const Joi = require('joi');

const createCommentSchema = Joi.object({
    content: Joi.string()
        .required()
        .messages({
            'string.empty': 'Nội dung không được để trống',
            'string.base': 'Nội dung phải là chuỗi',
        }),
    from: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.empty': 'Người gửi không được để trống',
            'string.pattern.base': 'Người gửi phải là ObjectId hợp lệ',
        }),
});

module.exports = {
    createCommentSchema
};
