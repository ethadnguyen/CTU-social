const mongoose = require('mongoose');
const slugify = require('slugify');
const FacultySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    majors: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Major'
        }
    ],
    slug: {
        type: String,
        unique: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
},
    {
        timestamps: true
    }
);

FacultySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

const Faculty = mongoose.model('Faculty', FacultySchema);

module.exports = Faculty;
