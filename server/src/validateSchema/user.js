const createUserSchema = {
    firstName: {
        in: ['body'],
        notEmpty: true,
        isString: {
            errorMessage: 'Tên phải là chuỗi'
        },
    },
    lastName: {
        in: ['body'],
        notEmpty: true,
        isString: {
            errorMessage: 'Họ và tên lót phải là chuỗi'
        }
    },
    email: {
        in: ['body'],
        notEmpty: true,
        isEmail: {
            errorMessage: 'Email phải là chuỗi'
        },
        matches: {
            options: /@student\.ctu\.edu\.vn$/,
            errorMessage: 'Email phải có định dạng @student.ctu.edu.vn'
        }
    },
    password: {
        in: ['body'],
        notEmpty: true,
        isLength: {
            options: { min: 6 },
            errorMessage: 'Mật khẩu phải ít nhất 6 ký tự'
        },
        isString: {
            errorMessage: 'Mật khẩu phải là chuỗi'
        }
    },
    student_id: {
        in: ['body'],
        notEmpty: true,
        isString: {
            errorMessage: 'Mã số sinh viên phải là chuỗi'
        }
    },
    role: {
        in: ['body'],
        optional: true,
        isIn: {
            options: [['user', 'admin']],
            errorMessage: 'Vai trò phải là "user" hoặc "admin"'
        },
        default: 'user'
    },
    avatar: {
        in: ['body'],
        optional: true,
        isString: {
            errorMessage: 'Ảnh đại diện phải là chuỗi'
        }
    },
    gender: {
        in: ['body'],
        optional: true,
        isIn: {
            options: [['Male', 'Female', 'Other']],
            errorMessage: 'Giới tính phải là "Male", "Female" hoặc "Other"'
        },
        default: 'Male'
    },
    phone: {
        in: ['body'],
        optional: true,
        isString: {
            errorMessage: 'Số điện thoại phải là chuỗi'
        },
        isMobilePhone: {
            options: ['vi-VN'],
            errorMessage: 'Số điện thoại không hợp lệ'
        }
    },
    dateOfBirth: {
        in: ['body'],
        optional: true,
        isDate: {
            errorMessage: 'Ngày sinh không hợp lệ'
        }
    },
    bio: {
        in: ['body'],
        optional: true,
        isString: {
            errorMessage: 'Tiểu sử phải là chuỗi'
        }
    },
    faculty: {
        in: ['body'],
        notEmpty: true,
        errorMessage: 'Khoa không được để trống',
        isMongoId: {
            errorMessage: 'Khoa phải là một ObjectId hợp lệ'
        }
    },
    major: {
        in: ['body'],
        notEmpty: true,
        errorMessage: 'Ngành không được để trống',
        isMongoId: {
            errorMessage: 'Ngành phải là một ObjectId hợp lệ'
        }
    },
    facebook: {
        in: ['body'],
        optional: true,
        isURL: {
            errorMessage: 'Liên kết facebook phải là chuỗi'
        }
    },
    linkedin: {
        in: ['body'],
        optional: true,
        isURL: {
            errorMessage: 'Liên kết linkedin phải là chuỗi'
        }
    },
    github: {
        in: ['body'],
        optional: true,
        isURL: {
            errorMessage: 'Liên kết github phải là chuỗi'
        }
    },
};


module.exports = {
    createUserSchema
};
