var request = require('request');
var app = require('./app');
var hueEndpoint = '/api/342716561e24f19024c9edfb8f89eee/lights/1/state';
var sensorID = 'co2SensorStub';
var platformUrl;
var io;

module.exports = function (_io, _platformURL) {
  io = _io;
  platformUrl = _platformURL;
  return {
    hueEndpointUrl: hueEndpoint,
    sensorID:       sensorID,
    high:           high,
    low:            low
  };
}

var state = {sat: 254, bri: 64, hue: 25500};
var sensor = 0
  , high = 1800
  , low = 500
  , counter = 0.0

app.put(hueEndpoint, function (req, res) {
  console.log("Fake HUE received new color " + JSON.stringify(req.body));
  state = req.body;
  res.sendStatus(200);
});

app.get(hueEndpoint, function (req, res) {
  res.send(state);
});

setInterval(function () {
  sensor = Math.floor((high - low) * Math.abs(Math.sin(counter)) + low);
  counter += 0.1;
  console.log('Fake CO2 sensor reading ' + sensor + ' ppm');
  io.sockets.emit('co2', {value: sensor});
  io.sockets.emit('hue', state);
  request.post(platformUrl + "/devices/" + sensorID)
    .form({value: sensor})
    .on('error', function (err) {
      console.log("Could not send sensor data to experimental platform: "+ err.code);
    });
}, 2000);
