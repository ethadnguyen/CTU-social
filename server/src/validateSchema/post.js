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
    files: Joi.array()
        .default([])
        .optional()
        .items(Joi.string().custom((value, helpers) => {
            const fileExtension = value.split('.').pop().toLowerCase();
            const validExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];
            if (!validExtensions.includes(fileExtension)) {
                return helpers.error('any.invalid');
            }
            return value;
        }))
        .messages({
            'array.base': 'Tệp phải là một mảng',
            'any.invalid': 'Tệp phải ở định dạng PDF, DOC, DOCX, PPT, PPTX, XLS hoặc XLSX',
        }),
    privacy: Joi.string()
        .valid('public', 'private')
        .required()
        .messages({
            'string.empty': 'Quyền riêng tư không được để trống',
            'any.only': 'Quyền riêng tư phải là "public" hoặc "private"',
        }),
});

module.exports = {
    createPostValidateSchema,
};
