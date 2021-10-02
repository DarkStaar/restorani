const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const { port, env } = require('./config/config');
const passport = require('passport');
const routes = require('./routes/v1');
const strategies = require('./passport');
const error = require('./middlewares/error');
const mongoose = require('./mongoose');
const app = express();

mongoose.connect();
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use(passport.initialize());
passport.use('jwt', strategies.jwt);
app.use('/v1', routes);

app.listen(port, () => console.log(`server started on port ${port} (${env})`));
app.use(error.converter);
app.use(error.notFound);
app.use(error.handler);

module.exports = app;
