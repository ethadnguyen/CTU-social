const express = require('express');
const { register, login } = require('../controllers/auth.controller');
const { checkSchema } = require('express-validator');
const { createUserSchema } = require('../validateSchema/user');
const router = express.Router();

router.post('/register', checkSchema(createUserSchema), register);

router.post('/login', login);

module.exports = router;