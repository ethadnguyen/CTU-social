const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'CTU Social Network API',
        description: 'Description for CTU Social Network API',
    },
    host: 'localhost:3000/api-docs',
};

const outputFile = './swagger-output.json';

const routes = [
    './routes/admin.route.js',
    './routes/user.route.js',
    './routes/admin.route.js',
    './routes/post.route.js',
    './routes/group.route.js'
];


swaggerAutogen(outputFile, routes, doc);
