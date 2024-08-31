const express = require('express');
const app = express();
const port = 3000;
const connectDB = require('./src/db/db');
const userRoute = require('./src/routes/user.route');
const facultyRoute = require('./src/routes/faculty.route');
const majorRoute = require('./src/routes/major.route');

require('dotenv').config();

connectDB();
app.use(express.json());

app.use('/users', userRoute);
app.use('/faculties', facultyRoute);
app.use('/majors', majorRoute);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
