var express = require('express')
  , reload = require('reload')
  , http = require('http')
  , app = require('./app')
  , server = http.createServer(app)
  , io = require('socket.io')(server);

var stub = require('./stub')(io);
var hueUrl = stub.hueUrl;

app.get('/', function (req, res) {
  res.render('index', {hueUrl: hueUrl});
});

reload(server, app);

server.listen(app.get('port'), function () {
  console.log("listening on " + app.get('port'));
});

