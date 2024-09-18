const express = require('express');
const {
    getAllFaculties,
    getFacultyById,
    createFaculty,
    updateFaculty,
    deleteFaculty
} = require('../controllers/admin.controller');
const { checkSchema } = require('express-validator');
const { createFacultySchema } = require('../validateSchema/faculty');

const router = express.Router();

router.get('/', getAllFaculties);

router.get('/:id', getFacultyById);

router.post('/', checkSchema(createFacultySchema), createFaculty);

router.patch('/:id', updateFaculty);

router.delete('/:id', deleteFaculty);


module.exports = router;