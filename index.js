var express = require('express')
  , bodyParser = require('body-parser')
  , reload = require('reload')
  , http = require('http')


var app = express();
var state = {sat: 254, bri: 64, hue: 25500};

app.set('port', process.env.PORT || 5000);
app.use(bodyParser.json());

app.put('/api/342716561e24f19024c9edfb8f89eee/lights/1/state', function (req, res) {
  console.log(req.body);
  state = req.body;
  res.sendStatus(200);
});

app.get('/api/342716561e24f19024c9edfb8f89eee/lights/1/state', function (req, res) {
  res.send(state);
});

app.get('/', function (req, res) {
  res.send(state);
});

var server = http.createServer(app);
reload(server, app);

server.listen(app.get('port'), function () {
  console.log("listening on " + app.get('port'));
});

