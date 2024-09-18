const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const hashString = async (useValue) => {
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(useValue, salt);
    return hashedPassword;
};

const compareString = async (userPassword, password) => {
    const isMatch = await bcrypt.compare(userPassword, password);
    return isMatch;
};

const createJWT = (id, role = 'user') => {
    return jwt.sign({ userId: id, role }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d',
    });
}

const isAdmin = (req, res, next) => {
    const user = req.body.user;
    console.log(user);
    if (user && user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Không đủ quyền truy cập' });
    }
};


module.exports = {
    hashString,
    compareString,
    createJWT,
    isAdmin
};