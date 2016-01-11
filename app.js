var express = require('express')
  , bodyParser = require('body-parser')
  , app = module.exports = express()

app.set('port', process.env.PORT || 5000);
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(express.static('public'));
