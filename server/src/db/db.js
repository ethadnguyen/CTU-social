const mongoose = require('mongoose');

const connectDB = () => {

    mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
            console.log('Connected to MongoDB');
        })
        .catch((error) => {
            console.error('Failed to connect to MongoDB', error);
        });
};

module.exports = connectDB;