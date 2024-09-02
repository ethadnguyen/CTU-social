const createMajorSchema = {
    majorName: {
        in: ['body'],
        notEmpty: true,
        isLength: {
            options: { min: 3 },
            errorMessage: 'Tên ngành phải ít nhất 3 ký tự'
        },
        isString: {
            errorMessage: 'Tên ngành phải là chuỗi'
        }
    },
    faculty: {
        in: ['body'],
        notEmpty: true,
        errorMessage: 'Khoa không được để trống'
    },
    academicYear: {
        in: ['body'],
        notEmpty: true,
        errorMessage: 'Niên khoá không được để trống',
        isString: {
            errorMessage: 'Niên khoá phải là chuỗi'
        },
        matches: {
            options: /K\d{2}/,
            errorMessage: 'Niên khoá không hợp lệ (Bắt đầu là K và theo sau là 2 chữ số)'
        }
    }
};

module.exports = {
    createMajorSchema
}