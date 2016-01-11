var app = require('./app');
var hueUrl = '/api/342716561e24f19024c9edfb8f89eee/lights/1/state';
var io;

module.exports = function (_io) {
  io = _io;
  return {hueUrl: hueUrl};
}

var state = {sat: 254, bri: 64, hue: 25500};
var sensor = 0
  , high = 2000
  , low = 500
  , counter = 0.0

app.put('/api/342716561e24f19024c9edfb8f89eee/lights/1/state', function (req, res) {
  console.log(req.body);
  state = req.body;
  res.sendStatus(200);
});

app.get('/api/342716561e24f19024c9edfb8f89eee/lights/1/state', function (req, res) {
  res.send(state);
});

setInterval(function () {
  sensor = Math.floor((high - low) * Math.abs(Math.sin(counter)) + low);
  counter += 0.1;
  console.log('co2 sensor reading ' + sensor + ' ppm');
  io.sockets.emit('co2', {value: sensor});
  io.sockets.emit('hue', state);
}, 2000);
