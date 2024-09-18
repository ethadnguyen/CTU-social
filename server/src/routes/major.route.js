const express = require('express');
const {
    getAllMajors,
    getMajorById,
    createMajor,
    updateMajor,
    deleteMajor
} = require('../controllers/admin.controller');
const { checkSchema } = require('express-validator');
const { createMajorSchema } = require('../validateSchema/major');
const router = express.Router();

router.get('/', getAllMajors);

router.get('/:id', getMajorById);

router.post('/', checkSchema(createMajorSchema), createMajor);

router.patch('/:id', updateMajor);

router.delete('/:id', deleteMajor);

module.exports = router;