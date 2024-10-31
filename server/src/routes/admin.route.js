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
    sendSecurityCode,
} = require('../controllers/admin.controller');
const { isAdmin } = require('../utils');
const authMiddleware = require('../middlewares/auth.middleware');
const { validateCreateActivity, validateCreateFaculty, validateCreateMajor } = require('../middlewares/validate.middleware');
const upload = require('../utils/upload');
const router = express.Router();


router.post('/send-otp', sendSecurityCode);


// route activity
router.get('/activities', authMiddleware, isAdmin, getAllActivities);

router.get('/activity/:id', authMiddleware, isAdmin, getActivity);

router.post('/create-activity', authMiddleware, isAdmin, validateCreateActivity, upload.single('images'), createActivity);

router.put('/update-activity/:id', authMiddleware, isAdmin, validateCreateActivity, updateActivity);


router.delete('/delete-activity/:id', authMiddleware, isAdmin, deleteActivity);

// route faculty

router.get('/faculties', authMiddleware, isAdmin, getAllFaculties);

router.post('/create-faculty', authMiddleware, isAdmin, validateCreateFaculty, createFaculty);

router.put('/update-faculty/:id', authMiddleware, isAdmin, validateCreateFaculty, updateFaculty);

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



