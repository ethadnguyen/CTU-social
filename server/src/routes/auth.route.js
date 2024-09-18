const express = require('express');
const { register, login, registerAdmin, loginAdmin } = require('../controllers/auth.controller');
const { checkSchema } = require('express-validator');
const { createUserSchema } = require('../validateSchema/user');
const router = express.Router();

router.post('/register', checkSchema(createUserSchema), register);

router.post('/login', login);

router.post('/admin/register', checkSchema(createUserSchema), registerAdmin);

router.post('/admin/login', loginAdmin);

module.exports = router;