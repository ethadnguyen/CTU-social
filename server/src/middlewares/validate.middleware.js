const { createActivitySchema } = require('../validateSchema/activity');
const { createCommentSchema } = require('../validateSchema/comment');
const { createFacultySchema } = require('../validateSchema/faculty');
const { createGroupPostValidateSchema } = require('../validateSchema/groupPost');
const { createGroupRequestValidateSchema } = require('../validateSchema/groupRequest');
const { createMajorSchema } = require('../validateSchema/major');
const { createPostValidateSchema, updatePostValidateSchema } = require('../validateSchema/post');
const { createUserSchema } = require('../validateSchema/user');
const { createAdminSchema } = require('../validateSchema/admin');
const { createCourseSchema } = require('../validateSchema/course');

const validateCreateActivity = (req, res, next) => {
    const { user, ...bodyWithoutUser } = req.body;

    const { error } = createActivitySchema.validate(bodyWithoutUser, { abortEarly: false });

    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ errors });
    }

    req.body.user = user;
    next();
};

const validateCreateComment = (req, res, next) => {
    const { user, ...bodyWithoutUser } = req.body;

    const { error } = createCommentSchema.validate(bodyWithoutUser, { abortEarly: false });

    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ errors });
    }

    req.body.user = user;
    next();
};

const validateCreateFaculty = (req, res, next) => {
    const { user, ...bodyWithoutUser } = req.body;

    const { error } = createFacultySchema.validate(bodyWithoutUser, { abortEarly: false });

    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ errors });
    }

    req.body.user = user;
    next();
};

const validateCreateGroupRequest = (req, res, next) => {
    const { user, ...bodyWithoutUser } = req.body;

    const { error } = createGroupRequestValidateSchema.validate(bodyWithoutUser, { abortEarly: false });

    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ errors });
    }

    req.body.user = user;
    next();
};

const validateCreateMajor = (req, res, next) => {
    const { user, ...bodyWithoutUser } = req.body;
    const { error } = createMajorSchema.validate(bodyWithoutUser, { abortEarly: false });

    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ errors });
    }

    req.body.user = user;
    next();
};

const validateCreateCourse = (req, res, next) => {
    const { user, ...bodyWithoutUser } = req.body;
    const { error } = createCourseSchema.validate(bodyWithoutUser, { abortEarly: false });

    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ errors });
    }

    req.body.user = user;
    next();
}

const validateCreatePost = (req, res, next) => {
    const { user, ...bodyWithoutUser } = req.body;
    const { error } = createPostValidateSchema.validate(bodyWithoutUser, { abortEarly: false });

    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ errors });
    }

    req.body.user = user;
    next();
};

const validateUpdatePost = (req, res, next) => {
    const { user, ...bodyWithoutUser } = req.body;
    const { error } = updatePostValidateSchema.validate(bodyWithoutUser, { abortEarly: false });

    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ errors });
    }

    req.body.user = user;
    next();
};

const validateCreateUser = (req, res, next) => {
    const { user, ...bodyWithoutUser } = req.body;
    const { error } = createUserSchema.validate(bodyWithoutUser, { abortEarly: false });

    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ errors });
    }

    req.body.user = user;
    next();
};

const validateCreateAdmin = (req, res, next) => {
    const { user, ...bodyWithoutUser } = req.body;
    const { error } = createAdminSchema.validate(bodyWithoutUser, { abortEarly: false });

    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ errors });
    }

    req.body.user = user;
    next();
}

const validateCreateGroupPost = (req, res, next) => {
    const { user, ...bodyWithoutUser } = req.body;
    const { error } = createGroupPostValidateSchema.validate(bodyWithoutUser, { abortEarly: false });

    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ errors });
    }

    req.body.user = user;
    next();
}

module.exports = {
    validateCreateActivity,
    validateCreateComment,
    validateCreateFaculty,
    validateCreateGroupRequest,
    validateCreateMajor,
    validateCreateCourse,
    validateCreatePost,
    validateUpdatePost,
    validateCreateGroupPost,
    validateCreateUser,
    validateCreateAdmin,
};
