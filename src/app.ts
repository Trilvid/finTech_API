import express, { Application, Request, Response, Express } from "express";
import morgan from "morgan";
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser';
import helmet from 'helmet'
import createError from 'http-errors'
import path from "path";
import swaggerDocs from "./utils/swagger";

// const auth =  require("./routes/authRoute");
// const story =  require("./routes/storyRoute");
// const comment = require("./routes/commentRoute");
// const errorHandeler = require("./controllers/errorHandler")
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');


const limiter = rateLimit({
  max: 20,
  windowMs: 30 * 60 * 1000,
  skipSuccessfulRequests: true,
  message: 'Too Many requests form this Ip, please try again in an hour!'
});


const app: Express = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());
app.use(helmet())
app.use(cors())
app.use('/api', limiter);
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());

app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));


app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ extended: true }));

// swagger documentation
const port = 5000
swaggerDocs(app, port)

// 2) Routes
app.get('/', (req:Request, res:Response) =>{
  res.send("hello Welcome to our application")
})
// app.use('/api/v1/auth', auth);
// app.use('/api/v1/users', auth);
// app.use('/api/v1/stories', story);
// app.use('/api/v1/comment', comment);

// 3) Error handler middleware - Place after route definitions
app.use((err: any, req:Request, res:Response, next: any) => {
  res.status(err.status || 500);
  res.send(err.message);
  next(createError(404))
});

app.all('*', (req, res, next) => {
  res.status(404).send(`Can't find ${req.originalUrl} on this server!`)
  return next();
});

// app.use(errorHandeler);

module.exports = app;

