const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: ''
    },
    link: {
        type: String,
        default: ''
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
    },
},
    {
        timestamp: true
    }
);

const Activity = mongoose.model('Activity', ActivitySchema);

module.exports = Activity;