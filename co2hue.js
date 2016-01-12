var request = require('request');
var app = require('./app');
var io, hueUrl;
var platformUrl;
var deviceID;

var highPPM    = 1500
  , mediumPPM  = 1000
  , currentPPM = 0;

var hueGreen  = {"on": true, "sat": 254, "bri": 64, "hue": 25500}
  , hueYellow = {"on": true, "sat": 254, "bri": 128,"hue": 12750}
  , hueRed    = {"on": true, "sat": 254, "bri": 192,"hue": 0};

module.exports = function (_io, _hueUrl, _deviceID, _platformURL) {
  io = _io;
  hueUrl = _hueUrl;
  deviceID = _deviceID;
  platformUrl = _platformURL;
}

app.post('/settings', function (req, res) {
  console.log(req.body);
  if (typeof(req.body.hueUrl) != 'undefined') {
    hueUrl = req.body.hueUrl;
    console.log("set hueUrl to " + hueUrl);
  }
});

var fetchCO2Level = function (success) {
  var ppm;
  request(platformUrl + "/devices/" + deviceID, function (error, response, body) {
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
  console.log("Setting color to " + JSON.stringify(hueColor) + " via " + hueUrl);
  request.put(hueUrl).json(hueColor)
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
