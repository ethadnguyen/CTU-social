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
    deleteAccount,
    getAllGroupRequests,
    acceptGroupRequest,
    rejectGroupRequest,
    getGroupRequest,
} = require('../controllers/admin.controller');
const { checkSchema } = require('express-validator');
const { isAdmin } = require('../utils');
const authMiddleware = require('../middlewares/auth.middleware');
const { createFacultySchema } = require('../validateSchema/faculty');
const { createActivitySchema } = require('../validateSchema/activity');
const router = express.Router();

//route activity

router.get('/activities', authMiddleware, isAdmin, getAllActivities);

router.get('/activity/:id', authMiddleware, isAdmin, getActivity);

router.post('/create-activity', authMiddleware, isAdmin, checkSchema(createActivitySchema), createActivity);

router.put('/update-activity/:id', authMiddleware, isAdmin, checkSchema(createActivitySchema), updateActivity);

router.delete('/delete-activity/:id', authMiddleware, isAdmin, deleteActivity);

// route faculty

router.get('/faculties', authMiddleware, isAdmin, getAllFaculties);

router.post('/create-faculty', authMiddleware, isAdmin, checkSchema(createFacultySchema), createFaculty);

router.put('/update-faculty/:id', authMiddleware, isAdmin, checkSchema(createFacultySchema), updateFaculty);

router.delete('/delete-faculty/:id', authMiddleware, isAdmin, deleteFaculty);

// route major

router.get('/majors', getAllMajors);

router.get('/major/:id', getMajor);

router.post('/create-major', createMajor);

router.put('/update-major/:id', updateMajor);

router.delete('/delete-major/:id', deleteMajor);

// route manage user

router.get('/get-all-users', authMiddleware, isAdmin, getAllAccounts);

router.get('/get-users-by-faculty', authMiddleware, isAdmin, getAccountsByFaculty);

router.get('/get-users-by-major', authMiddleware, isAdmin, getAccountsByMajor);

router.delete('/delete-user/:id', authMiddleware, isAdmin, deleteAccount);

// manage request

router.get('/get-all-group-requests', authMiddleware, isAdmin, getAllGroupRequests);

router.get('/get-group-request/:id', authMiddleware, isAdmin, getGroupRequest);

router.post('/accept-group-request', authMiddleware, isAdmin, acceptGroupRequest);

router.post('/reject-group-request', authMiddleware, isAdmin, rejectGroupRequest);

module.exports = router;
