const createActivitySchema = {
    title: {
        in: ['body'],
        notEmpty: true,
        errorMessage: 'Tiêu đề không được để trống',
        isString: {
            errorMessage: 'Tiêu đề phải là chuỗi'
        },
        isLength: {
            options: { min: 3 },
            errorMessage: 'Tiêu đề phải ít nhất 3 ký tự'
        },
    },
    description: {
        in: ['body'],
        optional: true,
        isString: {
            errorMessage: 'Mô tả phải là chuỗi'
        },
    },
    link: {
        in: ['body'],
        optional: true,
        isString: {
            errorMessage: 'Link phải là chuỗi'
        },
    },
    faculty: {
        in: ['body'],
        notEmpty: true,
        errorMessage: 'Khoa không được để trống',
        isMongoId: {
            errorMessage: 'Khoa phải là ObjectId'
        },
    },
};

module.exports = {
    createActivitySchema
};