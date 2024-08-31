const express = require('express');
const facultyController = require('../controllers/faculty.controller');

const router = express.Router();

// GET route for fetching all faculty
router.get('/', facultyController.getFaculties);

// POST route for creating a new faculty
router.post('/', facultyController.createFaculty);

module.exports = router;