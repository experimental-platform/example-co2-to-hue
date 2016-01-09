var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var state = {sat: 254, bri: 64, hue: 25500};

app.use(bodyParser.json());
app.set('port', (process.env.PORT || 5000));

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

app.listen(app.get('port'), function () {
  console.log("listening on " + app.get('port'));
});
