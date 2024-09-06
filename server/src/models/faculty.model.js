const mongoose = require('mongoose');

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
    ]
},
    {
        timestamps: true
    }
);

const Faculty = mongoose.model('Faculty', FacultySchema);

module.exports = Faculty;