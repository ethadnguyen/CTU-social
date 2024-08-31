const express = require('express');

const router = express.Router();
const majorController = require('../controllers/major.controller');

router.get('/', (req, res) => {

    res.send('GET request to retrieve all majors');
});

// GET route for retrieving a specific major by ID
router.get('/:id', (req, res) => {
    const majorId = req.params.id;

    res.send(`GET request to retrieve major with ID ${majorId}`);
});

// POST route for creating a new major
router.post('/', majorController.createMajor);

module.exports = router;