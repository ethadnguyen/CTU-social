const express = require('express');
const path = require('path');
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();


router.get('/verify/:userId/:token', UserController.verifyEmail);


router.get('/verified', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/build', 'index.html'));
});

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