const createPostValidateSchema = {
    content: {
        in: ['body'],
        notEmpty: true,
        errorMessage: 'Nội dung không được để trống',
        isLength: {
            options: { min: 1 },
            errorMessage: 'Nội dung phải ít nhất 1 ký tự'
        },
        isString: {
            errorMessage: 'Nội dung phải là chuỗi'
        }
    },
    images: {
        in: ['files'],
        optional: true,
        custom: {
            options: (value) => {
                if (!Array.isArray(value)) {
                    return false;
                }
                for (let i = 0; i < value.length; i++) {
                    const fileExtension = value[i].split('.').pop().toLowerCase();
                    if (fileExtension !== 'jpg' && fileExtension !== 'jpeg' && fileExtension !== 'png' && fileExtension !== 'gif') {
                        return false;
                    }
                }
                return true;
            },
            errorMessage: 'Hình ảnh phải ở định dạng JPG, JPEG, PNG hoặc GIF'
        }
    },
    files: {
        in: ['files'],
        optional: true,
        custom: {
            options: (value) => {
                if (!Array.isArray(value)) {
                    return false;
                }
                for (let i = 0; i < value.length; i++) {
                    const fileExtension = value[i].split('.').pop().toLowerCase();
                    if (fileExtension !== 'pdf' && fileExtension !== 'doc' && fileExtension !== 'docx' && fileExtension !== 'ppt' && fileExtension !== 'pptx' && fileExtension !== 'xls' && fileExtension !== 'xlsx') {
                        return false;
                    }
                }
                return true;
            },
            errorMessage: 'Tệp phải ở định dạng PDF, DOC, DOCX, PPT, PPTX, XLS hoặc XLSX'
        }
    },
}

module.exports = createPostValidateSchema;