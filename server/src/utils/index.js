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

const createJWT = (id) => {
    return jwt.sign({ userId: id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d',
    });
}

module.exports = {
    hashString,
    compareString,
    createJWT
};