
const express = require('express');
const { createServer } = require('http');

const getRouter = require('./routes/getRoutes');
const postRouter = require('./routes/postRoutes');
const {configureMiddleware} = require('./middleware');

const app = express();
configureMiddleware(app);
const server = createServer(app);

app.use('/', getRouter);
app.use('/', postRouter);

const port = 80;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});





