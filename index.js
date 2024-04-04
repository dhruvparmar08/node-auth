const http = require('http');
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const morgan = require("morgan");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const appRoute = require('./router/app');

require('dotenv').config();

const connectionString = process.env.connectionString;
app.use(express.static(__dirname+"/logo"));
app.use(cors({ origin: "http://localhost:4200" }));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");

    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );

    next();
});

app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true, parameterLimit: 1000000 }));

app.get('/', (req, res) => {
    res.status(200).json({ message: "200", success: true });
});

app.use('/api', appRoute);

const server = http.createServer(app);

server.setTimeout(60000);

mongoose.connect(connectionString);
//mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true,  useCreateIndex: true, useUnifiedTopology: true});
var conn = mongoose.connection;

conn.on('connected', function () {
    console.log("Successfully connected to MongoDB !!!");
});
conn.on('disconnected', function () {
    console.log("Successfully disconnected to MongoDB !!!");
});
conn.on('error', console.error.bind(console, 'connection error:'));

server.listen(port, () => {
    console.log("Connected to localhost :" + port);
});