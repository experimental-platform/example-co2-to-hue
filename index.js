var express = require('express')
  , reload = require('reload')
  , http = require('http')
  , app = require('./app')
  , server = http.createServer(app)
  , io = require('socket.io')(server);

var stub = require('./stub')(io);
var co2hue = require('./co2hue')(io);
var localAddress = 'http://localhost:' + app.get('port');

co2hue.authToken = stub.authToken;
co2hue.controllingSensor = stub.sensorID;
co2hue.bridgeAddress = localAddress;

app.get('/', function (req, res) {
  res.render('index', {
    fakeBridgeAddress: localAddress,
    bridgeAddress: co2hue.bridgeAddress,
    authToken: co2hue.authToken,
    fakeSensorID: stub.sensorID,
    controllingSensor: co2hue.controllingSensor,
    sensorData: co2hue.sensorData
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
  if ('controllingSensor' in settings) {
    co2hue.controllingSensor = settings.controllingSensor;
  }
  res.sendStatus(200);
});

reload(server, app);

server.listen(app.get('port'), function () {
  console.log("listening on " + app.get('port'));
});

