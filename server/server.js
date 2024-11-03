const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cron = require('node-cron');
const app = express();
const connectDB = require('./src/db/db');

const authRoute = require('./src/routes/auth.route');
const adminRoute = require('./src/routes/admin.route');
const userRoute = require('./src/routes/user.route');
const postRoute = require('./src/routes/post.route');
const facultyRoute = require('./src/routes/faculty.route');
const groupRoute = require('./src/routes/group.route');
const errorMiddleware = require('./src/middlewares/error.middleware');
const Verification = require('./src/models/emailVerification.model');
const userModel = require('./src/models/user.model');
// const __dirname = path.resolve(path.dirname(''));

require('dotenv').config();


app.use(express.static(path.join(__dirname, "src/views/build")));
const PORT = process.env.PORT || 3000;

connectDB();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));

app.use('/auth', authRoute);
app.use('/users', userRoute);
app.use('/admin', adminRoute)
app.use('/posts', postRoute);
app.use('/faculties', facultyRoute);
app.use('/group', groupRoute);


cron.schedule('0 * * * *', async () => {
    try {
        const unverifiedUsers = await userModel.find({ isVerified: false });

        for (const user of unverifiedUsers) {
            console.log(`Deleting unverified user with ID: ${user._id}`);
            await userModel.findByIdAndDelete(user._id);
            await Verification.findOneAndDelete({ userId: user._id });
            console.log(`User with ID ${user._id} has been deleted.`);
        }
    } catch (error) {
        console.error('Error deleting unverified users:', error);
    }
});

app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
