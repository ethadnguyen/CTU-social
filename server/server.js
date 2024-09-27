const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./src/swagger-output.json');
const app = express();
const connectDB = require('./src/db/db');

const authRoute = require('./src/routes/auth.route');
const adminRoute = require('./src/routes/admin.route');
const userRoute = require('./src/routes/user.route');
const postRoute = require('./src/routes/post.route');
const groupRoute = require('./src/routes/group.route');
const errorMiddleware = require('./src/middlewares/error.middleware');
// const __dirname = path.resolve(path.dirname(''));

require('dotenv').config();

// const swaggerOptions = {
//     definition: {
//         openapi: '3.0.0',
//         info: {
//             title: 'CTU Social Network API',
//             version: '1.0.0',
//             description: 'API documentation for the CTU Social Network platform',
//         },
//         servers: [
//             {
//                 url: `http://localhost:${process.env.PORT || 3000}`,
//             },
//         ],
//     },
//     apis: ['./src/routes/*.js'],
// };

// const swaggerDocs = swaggerJsDoc(swaggerOptions)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

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
app.use('/group', groupRoute);

app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Swagger API documentation available at http://localhost:${PORT}/api-docs`);
});
