const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true,
    },
    email: {
        type: String,
        unique: true,
    },
    token: String,
    createdAt: Date,
    expiresAt: Date,
});

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports = PasswordReset;