// Libraries
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

// Local Dependencies
const db = require('./db');
const views = require('./routes/views');
const api = require('./routes/api');

require('dotenv').load();

// Initialize App
const app = express();

// Use sessions for tracking logins
app.use(session({
  secret: 'pickit',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

// Middleware/Authentication
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Set Views
app.use('/', views);
app.set('view engine', 'pug');
app.use('/api', api);
app.use('/static', express.static('public'));



// Set up server
app.listen(process.env.PORT, () => {
  console.log('Server running on port ' + process.env.PORT);
});

