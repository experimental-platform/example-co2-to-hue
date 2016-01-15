var request = require('request');
var app = require('./app');
var io;

var highPPM    = 1500
  , mediumPPM  = 1000
  , sensorData = {}

var hueGreen  = {'on': true, 'sat': 254, 'bri': 64, 'hue': 25500}
  , hueYellow = {'on': true, 'sat': 254, 'bri': 128,'hue': 12750}
  , hueRed    = {'on': true, 'sat': 254, 'bri': 192,'hue': 0};

var config = {
  authToken: null,
  bridgeAddress: null,
  controllingSensor: null,
  sensorData: sensorData
};

module.exports = function (_io) {
  io = _io;
  return config;
}

var changeHueColor = function (newPPM, oldPPM) {
  if (ppmChangedToLow(newPPM, oldPPM)) {
    setHueTo(hueGreen);
  } else if (ppmChangedToMedium(newPPM, oldPPM)) {
    setHueTo(hueYellow);
  } else if (ppmChangedToHigh(newPPM, oldPPM)) {
    setHueTo(hueRed);
  }
}

app.post("/co2/:sensorID", function (req, res) {
  var sensorID = req.params.sensorID;
  var newPPM = parseInt(req.body.value);
  var oldPPM = sensorData[sensorID];

  if (!newPPM) {
    console.log('could not parse "' + req.body.value + '" to a number');
  } else {
    console.log('received new CO2 level. Old: ' + oldPPM + 'ppm - new: ' + newPPM + 'ppm');
  }

  sensorData[sensorID] = newPPM;
  io.sockets.emit('reading', sensorData);

  if (sensorID === config.controllingSensor) {
    changeHueColor(newPPM, oldPPM);
  }
  res.sendStatus(200);
});

var isLowPPM = function (ppm) {
  return ppm < mediumPPM;
}

var isMediumPPM = function (ppm) {
  return ppm > mediumPPM && ppm < highPPM;
}

var isHighPPM = function (ppm) {
  return ppm > highPPM;
}

var ppmChangedToLow = function (ppm, oldPPM) {
  return isLowPPM(ppm) && (oldPPM && !isLowPPM(oldPPM));
}

var ppmChangedToMedium = function (ppm, oldPPM) {
  return isMediumPPM(ppm) && (oldPPM && !isMediumPPM(oldPPM));
}

var ppmChangedToHigh = function (ppm, oldPPM) {
  return isHighPPM(ppm) && (oldPPM && !isHighPPM(oldPPM));
}

var setHueTo = function(hueColor) {
  if (config.bridgeAddress) {
    console.log('Setting color to ' + JSON.stringify(hueColor) + ' via ' + hueUrl());
    request.put(hueUrl()).json(hueColor).on('error', function (err) {
      console.log(err);
    });
  }
}

var hueUrl = function () {
  var baseUrl = config.bridgeAddress.slice(0, 4) == 'http' ? config.bridgeAddress : 'http://' + config.bridgeAddress;
  return baseUrl + '/api/' + config.authToken + '/lights/2/state';
}

