const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const connectDB = require('./src/db/db');
const authRoute = require('./src/routes/auth.route');
const userRoute = require('./src/routes/user.route');
const facultyRoute = require('./src/routes/faculty.route');
const majorRoute = require('./src/routes/major.route');
const errorMiddleware = require('./src/middlewares/error.middleware');

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
app.use('/faculties', facultyRoute);
app.use('/majors', majorRoute);

app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
