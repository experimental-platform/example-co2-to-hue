var express = require('express')
  , bodyParser = require('body-parser')
  , reload = require('reload')
  , http = require('http')


var app = express();
app.set('port', process.env.PORT || 5000);
app.use(bodyParser.json());
app.use(express.static('public'));

var server = http.createServer(app);
var io = require('socket.io')(server);

var state = {sat: 254, bri: 64, hue: 25500};
var sensor = 0
  , high = 2000
  , low = 500
  , counter = 0.0

setInterval(function () {
  sensor = Math.floor((high - low) * Math.abs(Math.sin(counter)) + low);
  counter += 0.1;
  console.log('co2 sensor reading ' + sensor + ' ppm');
  io.sockets.emit('co2', {value: sensor});
  io.sockets.emit('hue', state);
}, 2000);

app.put('/api/342716561e24f19024c9edfb8f89eee/lights/1/state', function (req, res) {
  console.log(req.body);
  state = req.body;
  res.sendStatus(200);
});

app.get('/api/342716561e24f19024c9edfb8f89eee/lights/1/state', function (req, res) {
  res.send(state);
});

app.get('/hue', function (req, res) {
  res.send(state);
});

app.get('/co2', function (req, res) {
  res.send(sensor.toString());
});

reload(server, app);

server.listen(app.get('port'), function () {
  console.log("listening on " + app.get('port'));
});

