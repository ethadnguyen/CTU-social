const Joi = require('joi');

const createPostValidateSchema = Joi.object({
    userId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.empty': 'UserId không được để trống',
            'string.pattern.base': 'UserId không hợp lệ',
        }),
    content: Joi.string()
        .min(1)
        .required()
        .messages({
            'string.empty': 'Nội dung không được để trống',
            'string.min': 'Nội dung phải ít nhất 1 ký tự',
            'string.base': 'Nội dung phải là chuỗi',
        }),
    images: Joi.array()
        .default([])
        .optional()
        .items(Joi.object().keys({
            secure_url: Joi.string().uri().required(),
        }))
        .messages({
            'array.base': 'Hình ảnh phải là một mảng',
            'object.base': 'Mỗi mục phải là một đối tượng',
            'string.uri': 'Hình ảnh phải là một URL hợp lệ',
        }),
    privacy: Joi.string()
        .valid('public', 'private')
        .required()
        .messages({
            'string.empty': 'Quyền riêng tư không được để trống',
            'any.only': 'Quyền riêng tư phải là "public" hoặc "private"',
        }),
});

const updatePostValidateSchema = createPostValidateSchema.keys({
    remainingImages: Joi.array()
        .optional()
        .items(Joi.string().uri())
        .messages({
            'array.base': 'remainingImages phải là một mảng',
            'string.uri': 'Mỗi đường dẫn hình ảnh phải là một URL hợp lệ',
        })
});

module.exports = {
    createPostValidateSchema,
    updatePostValidateSchema,
};