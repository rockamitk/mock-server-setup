const mongoose=require('mongoose');
const express= require('express');
const morgan= require('morgan');
const bodyParser= require('body-parser');
const cookieParser= require('cookie-parser');
const compress= require('compression');
const cors= require('cors');
const httpStatus= require('http-status');
const helmet= require('helmet');
const path= require('path');
const JWT = require('express-jwt');
const timeout = require('connect-timeout');
const fs = require('fs');
const moment = require('moment');
const Promise = require('bluebird');
mongoose.Promise = Promise;

const config= require('./config');
const APIError= require('./helpers/APIError');

const routes= require('./routes');
const logDir = './log';

if (!fs.existsSync(logDir)){
    fs.mkdirSync(logDir);
}

const app = express();

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compress());//response compress
app.use(helmet());// secure apps by setting various HTTP headers
app.use(cors());// enable CORS - Cross Origin Resource Sharing
app.use(morgan(':method :url :status :response-time ms :res[content-length] kb'));
app.use(morgan('combined', {
    stream: fs.createWriteStream(logDir+"/"+moment().format('YYYY-MM-DD')+"-logger.log", {flags: 'a'})
}));
app.use(timeout(60000));//clinet can wait upto 60 sec for response
app.use((req, res, next)=>{
    if (!req.timedout) next();
});

/**
 * VALIDATE TOKEN
 * Skip api, those are in path array
 */
app.use(JWT({secret: config.JWT_SECRET}).unless({
    path: [
      '/api/v1/auth/signup',
      '/api/v1/auth/login',
      '/api/health-check'//Whether server is respond
    ]})
);

//API URL
app.use('/api', routes);

/*Generic error*/
app.use(function(err, req, res, next) {
    console.log();
    if(!res.finished){
        console.log("Middileware error");
        return res.status(err.status).json({status: err.status, message: err.message});
    }
});


// catch 404 and forward to error handler
app.use((req, res, next) => {
  console.log();
  return res.status(httpStatus.NOT_FOUND).json({status: httpStatus.NOT_FOUND, message: "API does not exits."});
});

// connect to mongo db
const mongoUri = `mongodb://${config.MONGO.HOST}:${config.MONGO.PORT}/${config.MONGO.DB}`;
const conOptions = {
  useMongoClient: true,
  connectTimeoutMS:0,
  socketTimeoutMS: 0,
  keepAlive: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 300,
};

// mongoose.set('debug', true);
function connect() {
  mongoose.connect(mongoUri, conOptions);
}
mongoose.connection.on('error', (error) => {
  console.info("event_on_error: ");
  console.info(error);
});
mongoose.connection.on('disconnected', function (error) {
  if(error)console.error(error);
  console.info("event_on_disconnected: call connect()");
  connect();
});
mongoose.connection.on('close', function (error) {
  if(error)console.error(error);
  console.info("event_on_close: call connect()");
  connect();
});
mongoose.connection.on('reconnected', function () {
  console.log('event_on_reconnected: success.');
});

mongoose.connect(mongoUri, conOptions, ()=>{
  console.info("mongodb has connected !!");
  app.listen(config.PORT, function() {
      console.info('Server has running,  PORT:' + config.PORT);
      console.log(`Process id ${process.pid} `);
      // require('../helpers/api.stack')('/api/projects', router.stack);
  });
});

module.exports = app;