var express = require('express')
  , reload = require('reload')
  , http = require('http')
  , app = require('./app')
  , server = http.createServer(app)
  , io = require('socket.io')(server);

var platformUrl = process.env.PLATFORM_URL || 'http://localhost:3200';
var stub = require('./stub')(io, platformUrl);
var hueUrl = 'http://localhost:' + app.get('port') + stub.hueEndpointUrl;
var co2hue = require('./co2hue')(io, hueUrl, stub.sensorID, platformUrl);

app.get('/', function (req, res) {
  res.render('index', {
    hueUrl: hueUrl,
    fakeSensorID: stub.sensorID
  });
});

reload(server, app);

server.listen(app.get('port'), function () {
  console.log("listening on " + app.get('port'));
});

