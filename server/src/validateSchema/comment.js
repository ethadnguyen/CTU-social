const createCommentSchema = {
    content: {
        in: ['body'],
        notEmpty: {
            errorMessage: 'Nội dung không được để trống',
        },
        isString: {
            errorMessage: 'Nội dung phải là chuỗi',
        },
    },
    from: {
        in: ['body'],
        notEmpty: {
            errorMessage: 'Người gửi không được để trống',
        },
        isString: {
            errorMessage: 'Người gửi phải là chuỗi',
        },
    },
    replies: {
        in: ['body'],
        isArray: {
            errorMessage: 'Phản hồi phải là mảng',
        },
    },
    user: {
        in: ['body'],
        notEmpty: {
            errorMessage: 'Người dùng không được để trống',
        },
        isMongoId: {
            errorMessage: 'Người dùng phải là mongoose id',
        },
    },
    post: {
        in: ['body'],
        notEmpty: {
            errorMessage: 'Bài viết không được để trống',
        },
        isMongoId: {
            errorMessage: 'Bài viết phải là mongoose id',
        },
    },
    likes: {
        in: ['body'],
        isInt: {
            errorMessage: 'Số lượt thích phải là số nguyên',
        },
    },
    likedBy: {
        in: ['body'],
        isArray: {
            errorMessage: 'Người thích phải là mảng',
        },
    },
    reports: {
        in: ['body'],
        isInt: {
            errorMessage: 'Số lượt báo cáo phải là số nguyên',
        },
    },
    reportedBy: {
        in: ['body'],
        isArray: {
            errorMessage: 'Người báo cáo phải là mảng',
        },
    },
};