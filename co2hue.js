var request = require('request');
var app = require('./app');
var io;

var highPPM    = 1500
  , mediumPPM  = 1000
  , currentPPM = 0;

var hueGreen  = {'on': true, 'sat': 254, 'bri': 64, 'hue': 25500}
  , hueYellow = {'on': true, 'sat': 254, 'bri': 128,'hue': 12750}
  , hueRed    = {'on': true, 'sat': 254, 'bri': 192,'hue': 0};

var config = {
  authToken: null,
  bridgeAddress: null,
  sensorID: null
};

module.exports = function (_io, _platformURL) {
  io = _io;
  platformUrl = _platformURL;
  return config;
}

var fetchCO2Level = function (success) {
  var ppm;
  request(platformUrl + '/devices/' + config.sensorID, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      ppm = parseInt(JSON.parse(body).value);
      success(ppm);
    }
  });
}

var isLowPPM = function (ppm) {
  return ppm < mediumPPM;
}

var isMediumPPM = function (ppm) {
  return ppm > mediumPPM && ppm < highPPM;
}

var isHighPPM = function (ppm) {
  return ppm > highPPM;
}

var ppmChangedToLow = function (ppm) {
  return isLowPPM(ppm) && !isLowPPM(currentPPM);
}

var ppmChangedToMedium = function (ppm) {
  return isMediumPPM(ppm) && !isMediumPPM(currentPPM)
}

var ppmChangedToHigh = function (ppm) {
  return isHighPPM(ppm) && !isHighPPM(currentPPM);
}

var setHueTo = function(hueColor) {
  if (config.bridgeAddress) {
    console.log('Setting color to ' + JSON.stringify(hueColor) + ' via ' + hueUrl());
    request.put(hueUrl()).json(hueColor)
  }
}

var hueUrl = function () {
  var baseUrl = config.bridgeAddress.slice(0, 4) == 'http' ? config.bridgeAddress : 'http://' + config.bridgeAddress;
  return baseUrl + '/api/' + config.authToken + '/lights/2/state';
}

setInterval(function () {
  fetchCO2Level(function (newPPM) {
    if (!isNaN(newPPM) && newPPM != currentPPM) {
      if (ppmChangedToLow(newPPM)) {
        setHueTo(hueGreen);
      } else if (ppmChangedToMedium(newPPM)) {
        setHueTo(hueYellow);
      } else if (ppmChangedToHigh(newPPM)) {
        setHueTo(hueRed);
      }
      currentPPM = newPPM;
    }
  });
}, 1000);
