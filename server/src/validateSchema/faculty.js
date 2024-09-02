
const createFacultySchema = {
    name: {
        in: ['body'],
        notEmpty: true,
        isLength: {
            options: { min: 3 },
            errorMessage: 'Tên khoa phải ít nhất 3 ký tự'
        },
        isString: {
            errorMessage: 'Tên khoa phải là chuỗi'
        }
    }
}

module.exports = {
    createFacultySchema
}