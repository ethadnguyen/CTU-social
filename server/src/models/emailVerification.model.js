const mongoose = require('mongoose');

const emailVerificationSchema = new mongoose.Schema({
    userId: String,
    token: String,
    createdAt: Date,
    expiresAt: Date
});

const Verification = mongoose.model('Verification', emailVerificationSchema);

module.exports = Verification;