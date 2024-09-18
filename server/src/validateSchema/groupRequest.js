const createGroupRequestValidateSchema = {
    name: {
        in: ['body'],
        notEmpty: true,
        errorMessage: 'Tên nhóm không được để trống',
        isString: {
            errorMessage: 'name must be a string'
        }
    },
    description: {
        in: ['body'],
        notEmpty: true,
        errorMessage: 'Mô tả không được để trống',
        isString: {
            errorMessage: 'description must be a string'
        },
    },
    status: {
        in: ['body'],
        optional: true,
        isString: {
            errorMessage: 'status must be a string'
        },
        default: 'PENDING'
    },
};

module.exports = createGroupRequestValidateSchema;