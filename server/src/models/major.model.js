const mongoose = require('mongoose');

const MajorSchema = new mongoose.Schema({
    majorName: {
        type: String,
        required: true,
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
},
    {
        timestamps: true
    }
);

MajorSchema.index({ majorName: 1, academicYear: 1 }, { unique: true });
const Major = mongoose.model('Major', MajorSchema);

module.exports = Major;
