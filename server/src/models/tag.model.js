const mongoose = require('mongoose');

const tagSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    files: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'File',
        }
    ]
});

module.exports = mongoose.model('Tag', tagSchema);