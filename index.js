var express = require('express')
  , reload = require('reload')
  , http = require('http')
  , app = require('./app')
  , server = http.createServer(app)
  , io = require('socket.io')(server);

var platformUrl = process.env.PLATFORM_URL || 'http://localhost:3200';
var stub = require('./stub')(io, platformUrl);
var co2hue = require('./co2hue')(io, platformUrl);

co2hue.authToken = stub.authToken;
co2hue.sensorID = stub.sensorID;
co2hue.bridgeAddress = 'http://localhost:' + app.get('port')

app.get('/', function (req, res) {
  res.render('index', {
    fakeSensorID: stub.sensorID,
    authToken: co2hue.authToken,
    sensorID: co2hue.sensorID
  });
});

app.post('/settings', function (req, res) {
  console.log(req);
  var settings = req.body;
  console.log(settings);

  if ('authToken' in settings) {
    co2hue.authToken = settings.authToken;
  }
  if ('bridgeAddress' in settings) {
    co2hue.bridgeAddress = settings.bridgeAddress;
  }
  if ('sensorID' in settings) {
    co2hue.sensorID = settings.sensorID;
  }
});

reload(server, app);

server.listen(app.get('port'), function () {
  console.log("listening on " + app.get('port'));
});

