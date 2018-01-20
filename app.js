// Libraries
const express = require('express');
const bodyParser = require('body-parser');

// Local Dependencies
const db = require('./db');
const views = require('./routes/views');
const api = require('./routes/api');

require('dotenv').load();

// Initialize App
const app = express();

// Middleware/Authentication
app.use(bodyParser.json());

// Set Views
app.use('/', views);
app.set('view engine', 'pug');
app.use('/api', api);
app.use('/static', express.static('public'));

// Set up server
app.listen(process.env.PORT, () => {
  console.log('Server running on port ' + process.env.PORT);
});

