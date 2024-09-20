const mongoose = require('mongoose');
const slugify = require('slugify');
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
    slug: {
        type: String,
        unique: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    isFacultyDeleted: {
        type: Boolean,
        default: false,
    }
},
    {
        timestamps: true
    }
);

MajorSchema.pre('save', function (next) {
    if (this.isModified('majorName') || this.isModified('academicYear')) {
        this.slug = slugify(`${this.majorName} ${this.academicYear}`, { lower: true, strict: true });
    }
    next();
});


MajorSchema.index({ majorName: 1, academicYear: 1 }, { unique: true });

MajorSchema.index({ slug: 1, majorName: 1, academicYear: 1 }, { unique: true });

const Major = mongoose.model('Major', MajorSchema);

module.exports = Major;
