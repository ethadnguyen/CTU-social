const Joi = require('joi');

const createGroupPostValidateSchema = Joi.object({
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
        .items(Joi.string().custom((value, helpers) => {
            const fileExtension = value.split('.').pop().toLowerCase();
            const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];
            if (!validExtensions.includes(fileExtension)) {
                return helpers.error('any.invalid');
            }
            return value;
        }))
        .messages({
            'array.base': 'Hình ảnh phải là một mảng',
            'any.invalid': 'Hình ảnh phải ở định dạng JPG, JPEG, PNG hoặc GIF',
        }),
    groupId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'groupId không hợp lệ, phải là một ObjectId hợp lệ',
            'any.required': 'groupId là bắt buộc',
        }),
});

module.exports = {
    createGroupPostValidateSchema,
};
