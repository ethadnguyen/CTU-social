const express = require('express');
const {
    getFaculties,
    getFaculty,
    getMajors,
} = require('../controllers/faculty.controller');

const router = express.Router();

router.get('/', getFaculties);

router.get('/:facultyId', getFaculty);

router.get('/:facultyId/majors', getMajors);

module.exports = router;