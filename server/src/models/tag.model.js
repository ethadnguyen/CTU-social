const mongoose = require('mongoose');

const tagSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    files: [
        {
            id: { type: Number },
            name: { type: String },
            url: { type: String },
            uploadedAt: { type: Date, default: Date.now }
        }
    ]
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Tag', tagSchema);