const express = require('express');
const {
    getAllActivities,
    getActivity,
    createActivity,
    getAllFaculties,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    getAllMajors,
    updateActivity,
    deleteActivity,
    createMajor,
    updateMajor,
    deleteMajor,
    getMajor,
    getAllAccounts,
    getAccountsByFaculty,
    getAccountsByMajor,
    getAccount,
    deleteAccount,
    getAllGroupRequests,
    acceptGroupRequest,
    rejectGroupRequest,
    getGroupRequest,
    getAllGroups,
    getGroup,
    deleteGroup,
    getGroupByOwner,
    getGroupByUser,
} = require('../controllers/admin.controller');
const { isAdmin } = require('../utils');
const authMiddleware = require('../middlewares/auth.middleware');
const { validateCreateActivity, validateCreateFaculty, validateCreateMajor } = require('../middlewares/validate.middleware');
const upload = require('../utils/upload');
const router = express.Router();




//route activity

/**
 * @swagger
 * /admin/activities:
 *   get:
 *     tags: 
 *       - Admin
 *     summary: Retrieve all activities
 *     description: Trả về tất cả các hoạt động. Yêu cầu quyền admin.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of activities
 *       403:
 *         description: Forbidden, user is not an admin
 *       500:
 *         description: Internal Server Error
 */
router.get('/activities', authMiddleware, isAdmin, getAllActivities);

/**
 * @swagger
 * /activity/{id}:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Retrieve an activity by ID
 *     description: Trả về một hoạt động dựa trên ID. Yêu cầu quyền admin.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: ID of the activity
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The requested activity
 *       403:
 *         description: Forbidden, user is not an admin
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/activity/:id', authMiddleware, isAdmin, getActivity);

/**
 * @swagger
 * /create-activity:
 *   post:
 *     tags: 
 *       - Admin
 *     summary: Create a new activity
 *     description: Tạo một hoạt động mới. Yêu cầu quyền admin.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: images
 *         type: file
 *         description: Image files for the activity
 *       - in: body
 *         name: body
 *         description: The activity creation data
 *         schema:
 *           type: object
 *           required:
 *             - title
 *             - description
 *           properties:
 *             title:
 *               type: string
 *             description:
 *               type: string
 *             link:
 *               type: string
 *             faculty:
 *               type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Activity created successfully
 *       400:
 *         description: Bad request, validation failed
 *       403:
 *         description: Forbidden, user is not an admin
 *       500:
 *         description: Internal Server Error
 */
router.post('/create-activity', authMiddleware, isAdmin, validateCreateActivity, upload.single('images'), createActivity);

/**
 * @swagger
 * /update-activity/{id}:
 *   put:
 *     tags: 
 *       - Admin
 *     summary: Update an existing activity
 *     description: Cập nhật một hoạt động đã tồn tại. Yêu cầu quyền admin.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: The ID of the activity to update
 *       - in: formData
 *         name: image
 *         type: file
 *         description: An optional image file to update the activity's image
 *       - in: body
 *         name: body
 *         description: The fields to update for the activity
 *         schema:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *               description: The title of the activity
 *             description:
 *               type: string
 *               description: The description of the activity
 *             link:
 *               type: string
 *               description: An optional link related to the activity
 *             faculty:
 *               type: string
 *               description: The faculty the activity belongs to
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The activity was updated successfully
 *       400:
 *         description: Bad request, validation failed
 *       403:
 *         description: Forbidden, user is not authorized
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/update-activity/:id', authMiddleware, isAdmin, validateCreateActivity, updateActivity);

/**
 * @swagger
 * /delete-activity/{id}:
 *   delete:
 *     tags: 
 *       - Admin
 *     summary: Delete an activity
 *     description: Xóa một hoạt động. Yêu cầu quyền admin.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: ID of the activity to be deleted
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Activity deleted successfully
 *       403:
 *         description: Forbidden, user is not an admin
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/delete-activity/:id', authMiddleware, isAdmin, deleteActivity);

// route faculty

/**
 * @swagger
 * /faculties:
 *   get:
 *     tags: 
 *       - Admin
 *     summary: Get all faculties
 *     description: Lấy danh sách tất cả các khoa
 *     responses:
 *       200:
 *         description: A list of faculties
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/faculties', authMiddleware, isAdmin, getAllFaculties);

/**
 * @swagger
 * /create-faculty:
 *   post:
 *     tags: 
 *       - Admin
 *     summary: Create a new faculty
 *     description: Tạo một khoa mới
 *     parameters:
 *       - in: body
 *         name: body
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - description
 *           properties:
 *             name:
 *               type: string
 *               example: "Công nghệ thông tin và truyền thông"
 *     responses:
 *       201:
 *         description: Faculty created successfully
 *       400:
 *         description: Bad Request
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post('/create-faculty', authMiddleware, isAdmin, validateCreateFaculty, createFaculty);

/**
 * @swagger
 * /update-faculty/{id}:
 *   put:
 *     tags: 
 *       - Admin
 *     summary: Update an existing faculty
 *     description: Cập nhật thông tin khoa dựa trên ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: Faculty ID
 *       - in: body
 *         name: body
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - description
 *           properties:
 *             name:
 *               type: string
 *               example: "Công nghệ thông tin và truyền thông"
 *     responses:
 *       200:
 *         description: Faculty updated successfully
 *       400:
 *         description: Bad Request
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Faculty not found
 *       500:
 *         description: Internal server error
 */
router.put('/update-faculty/:id', authMiddleware, isAdmin, validateCreateFaculty, updateFaculty);

/**
 * @swagger
 * /delete-faculty/{id}:
 *   delete:
 *     tags: 
 *       - Admin
 *     summary: Delete a faculty by ID
 *     description: Xóa một khoa dựa trên ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: Faculty ID
 *     responses:
 *       200:
 *         description: Faculty deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Faculty not found
 *       500:
 *         description: Internal server error
 */
router.delete('/delete-faculty/:id', authMiddleware, isAdmin, deleteFaculty);

// route major

router.get('/majors', authMiddleware, isAdmin, getAllMajors);

router.get('/major/:id', authMiddleware, isAdmin, getMajor);

router.post('/create-major', authMiddleware, isAdmin, validateCreateMajor, createMajor);

router.put('/update-major/:id', authMiddleware, isAdmin, validateCreateMajor, updateMajor);

router.delete('/delete-major/:id', authMiddleware, isAdmin, deleteMajor);

// route manage user

router.get('/accounts', authMiddleware, isAdmin, getAllAccounts);

router.get('/accounts-by-faculty', authMiddleware, isAdmin, getAccountsByFaculty);

router.get('/accounts-by-major', authMiddleware, isAdmin, getAccountsByMajor);

router.get('/accounts/:id', authMiddleware, isAdmin, getAccount);

router.delete('/delete-account/:id', authMiddleware, isAdmin, deleteAccount);

// manage request

router.get('/group-requests', authMiddleware, isAdmin, getAllGroupRequests);

router.get('/group-requests/:id', authMiddleware, isAdmin, getGroupRequest);

router.post('/accept-group-request', authMiddleware, isAdmin, acceptGroupRequest);

router.post('/reject-group-request', authMiddleware, isAdmin, rejectGroupRequest);

// manage groups
router.get('/groups', authMiddleware, isAdmin, getAllGroups);

router.get('/groups/:id', authMiddleware, isAdmin, getGroup);

router.get('/groups/:userId', authMiddleware, isAdmin, getGroupByUser);

router.get('/groups/:ownerId', authMiddleware, isAdmin, getGroupByOwner);

router.delete('/delete-group/:id', authMiddleware, isAdmin, deleteGroup);



module.exports = router;



