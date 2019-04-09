require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

const connectUri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

mongoose.connect(
  connectUri,
  {useNewUrlParser: true}
)

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressValidator());

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
