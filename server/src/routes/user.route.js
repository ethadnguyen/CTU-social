const express = require('express');
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// GET /users
router.get('/', (req, res) => {
    res.send('Get all users');
});

// GET /users/:id
router.get('/:id', (req, res) => {
    const userId = req.params.id;
    res.send(`Get user with id ${userId}`);
});

// POST /users
router.post('/register', UserController.register);
router.post('/login', UserController.login);
// PUT /users/:id
router.put('/:id', (req, res) => {
    const userId = req.params.id;
    res.send(`Update user with id ${userId}`);
});

// DELETE /users/:id
router.delete('/:id', (req, res) => {
    const userId = req.params.id;
    res.send(`Delete user with id ${userId}`);
});

module.exports = router;