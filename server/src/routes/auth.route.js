const express = require('express');
const { register, login, registerAdmin, loginAdmin } = require('../controllers/auth.controller');
const { validateCreateUser } = require('../middlewares/validate.middleware');
const router = express.Router();


/**
 * @swagger
 * /register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Đăng ký người dùng
 *     description: Tạo tài khoản người dùng mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Nguyen
 *               lastName:
 *                 type: string
 *                 example: Luu Tri
 *               email:
 *                 type: string
 *                 example: nguyenB2110132@student.ctu.edu.vn
 *               faculty:
 *                 type: string
 *                 example: Công nghệ thông tin và truyền thông
 *               major:
 *                 type: string
 *                 example: Hệ thống thông tin
 *               student_id:
 *                 type: string
 *                 example: B2110132
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: 2003-08-13
 *               phone:
 *                 type: string
 *                 example: 0961234567
 *               password:
 *                 type: string
 *                 example: password123
 *               bio:
 *                 type: string
 *                 example: Hello I'm Nguyen Luu Tri
 *               facebook:
 *                 type: string
 *                 example: https://www.facebook.com/nguyenluutri
 *               linkedin:
 *                 type: string
 *                 example: https://www.linkedin.com/in/nguyenluutri
 *               github:
 *                 type: string
 *                 example: https://www.github.com/nguyenluutri
 *     responses:
 *       201:
 *         description: Tạo tài khoản thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Đăng ký thành công
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi hệ thống
 */
router.post('/register', validateCreateUser, register);

router.post('/login', login);

router.post('/admin/register', validateCreateUser, registerAdmin);

router.post('/admin/login', loginAdmin);

module.exports = router;