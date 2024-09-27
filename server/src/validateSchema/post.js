const Joi = require('joi');

const createPostValidateSchema = Joi.object({
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
});

module.exports = {
    createPostValidateSchema,
};
