import express from 'express';

const app = express();

app.disable('x-powered-by');

app.use('/', express.static('src'));

app.listen(9017, err => {
    console.log(`[ + ] The server is running.`);
});