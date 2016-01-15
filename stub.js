var request = require('request');
var app = require('./app');
var authToken = '342716561e24f19024c9edfb8f89eee'
var hueEndpoint = '/api/' + authToken + '/lights/2/state';
var sensorID = 'co2SensorStub';
var io;

module.exports = function (_io) {
  io = _io;

  io.on('connection', function (socket) {
    socket.emit('hue', color);
  });

  publishToApp();
  return {
    authToken: authToken,
    sensorID:  sensorID,
    high:      high,
    low:       low
  };
}

var color = {sat: 254, bri: 64, hue: 25500};
var sensor = 0
  , high = 1800
  , low = 500
  , counter = 0.0

app.put(hueEndpoint, function (req, res) {
  console.log("Dummy HUE received new color " + JSON.stringify(req.body));
  color = req.body;
  io.sockets.emit('hue', color);
  res.sendStatus(200);
});

setInterval(function () {
  sensor = Math.floor((high - low) * Math.abs(Math.sin(counter)) + low);
  counter += 0.1;
  console.log('Dummy CO2 sensor reading ' + sensor + ' ppm');
  io.sockets.emit('co2', {value: sensor});
}, 1000);

var publishToApp = function () {
  setTimeout(function () {
    var co2Endpoint = "http://localhost:" + app.get('port') + "/co2";
    console.log("publishing to " + co2Endpoint);
    request.post(co2Endpoint, function (err, res, body) { publishToApp() })
      .form({value: sensor})
      .on('error', function (err) {
        console.log("Could not send sensor data to experimental platform: "+ err.code);
      });
  }, 2000);
}

