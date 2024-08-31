const mongoose = require('mongoose');

const MajorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    academic_year: {
        type: String,
        required: true
    },
},
    {
        timestamp: true
    }
);

const Major = mongoose.model('Major', MajorSchema);

module.exports = Major;
