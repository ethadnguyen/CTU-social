const Joi = require('joi');

const createAdminSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .regex(/@student\.ctu\.edu\.vn$/)
        .messages({
            'string.empty': 'Email không được để trống',
            'string.email': 'Email phải là một địa chỉ email hợp lệ',
            'string.pattern.base': 'Email phải có định dạng @student.ctu.edu.vn',
        }),
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.empty': 'Mật khẩu không được để trống',
            'string.min': 'Mật khẩu phải ít nhất 6 ký tự',
            'string.base': 'Mật khẩu phải là chuỗi',
        }),
    securityCode: Joi.string()
        .pattern(/^\d{6}$/)
        .required()
        .messages({
            'string.empty': 'Mã bảo mật không được để trống',
            'string.pattern.base': 'Mã bảo mật phải là 6 ký tự số',
            'string.base': 'Mã bảo mật phải là chuỗi',
        }),
});

module.exports = {
    createAdminSchema,
};
