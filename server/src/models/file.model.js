const mongoose = require('mongoose');

const fileSchema = mongoose.Schema({
    dayUploaded: {
        type: Date,
        default: Date.now,
    },
    url: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('File', fileSchema);