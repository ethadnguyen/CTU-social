const express = require('express');
const { register, login, registerAdmin, loginAdmin } = require('../controllers/auth.controller');
const { validateCreateUser } = require('../middlewares/validate.middleware');
const router = express.Router();


router.post('/register', validateCreateUser, register);

router.post('/login', login);

router.post('/admin/register', validateCreateUser, registerAdmin);

router.post('/admin/login', loginAdmin);

module.exports = router;