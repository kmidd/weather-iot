const readingData = require("../data/iotReadingData.js");
const helpers = require("./helpers.js");
const moment = require('moment');

/****
 *  IotSession class
 */
function IotSession(sessionData) {

  if (sessionData) {
    this.IotSessionId = sessionData.IotSessionId;
  }
  this.SessionDate = sessionData ? sessionData.SessionDate : new Date().toISOString().slice(0, 19).replace('T', ' '); // sqlite requires dates in string format
  this.IotReadings = [];
}

IotSession.prototype.IotSessionId = null;
IotSession.prototype.SessionDate = null;
IotSession.prototype.IotReadings = [];



/****
 *  IotReading class
 */
function IotReading(iotReadingsId, propertyName, propertyValue) {
  this.IotReadingsld = iotReadingsId;
  this.PropertyName = propertyName;
  this.PropertyValue = propertyValue;
}

IotReading.prototype.IotReadingsld = null;
IotReading.prototype.PropertyName = null;
IotReading.prototype.PropertyValue = null;

/**
 * IOT Session Reading module methods
 */
exports.save_iot_session_data = function (req, res) {

  var success = true;
  var session = new IotSession();

  console.log("============= " + Date().toLocaleString('en-GB', { hour12: false }) + " =============");

  for (var q in req.query) {
    console.log("param : " + q + " = " + req.query[q]);
    if (req.query.hasOwnProperty(q)) {
      session.IotReadings.push(new IotReading(null, q, req.query[q]))
    }
  }

  readingData.create_session(session, function (err, results) {

    if (err) {
      res.status(500);
    }
    else {
      res.status(200);
    }

    res.end();
  });
};

exports.get_latest_session_data = function (req, res) {

  readingData.get_latest_session_data(function (err, results) {
    if (err) {
      res.status(500);
    }
    else {

      var latestSession = [];
      var sess = new IotSession(results.length ? results[0] : null);

      for (var i = 0; i < results.length; i++) {
        sess.IotReadings.push(new IotReading(results[i].PropertyId, results[i].PropertyName, results[i].PropertyValue))
      }

      latestSession.push(sess)

      helpers.send_success(res, { sessions: latestSession });
      res.status(200);
    }

    res.end();
  });
};

exports.get_all_session_data = function (req, res) {

  readingData.get_all_session_data(function (err, results) {
    if (err) {
      res.status(500);
    }
    else {

      var sessions = [];
      var lastId = -1;
      var sess;
      for (var i = 0; i < results.length; i++) {
        if (results[i].IotSessionId != lastId) {
          lastId = results[i].IotSessionId;
          if (results[i].IotSessionId > 0) {
            sessions.push(sess)
          }
          sess = new IotSession(results.length ? results[i] : null);
        }
        sess.IotReadings.push(new IotReading(results[i].PropertyId, results[i].PropertyName, results[i].PropertyValue))
      }

      sessions.push(sess)

      helpers.send_success(res, { sessions: sessions });
      res.status(200);
    }

    res.end();
  });
};

exports.getMaxMinByMonth = function (req, res) {
  const year = req.params.monthYear.split('-')[0];
  const month = req.params.monthYear.split('-')[1];

  readingData.getFormattedDataByMonth(month, year, function (err, results) {
    if (err) {
      console.log(err);
      res.status(500);
    }
    else {

      let currDay = -1;
      let dailyResults = {
        monthYear: req.params.monthYear,
        readings: []
      };
      let dayObj;
      let max, min;
      let tempTotal
      let tempCount = 0;

      results.forEach(r => {
        try {
          const currDt = moment(r.sessionDate);
          if (currDt.date() != currDay) {
            if (currDay >= 0) {
              dayObj = { day: currDay, max, min, mean: parseFloat((tempTotal / tempCount).toFixed(2)) };
              dailyResults.readings.push(dayObj);
            }
            tempTotal = 0;
            tempCount = 0;
            max = -999;
            min = 999;
            currDay = currDt.date();
          }
          let tempCentegrade = parseFloat(r.tempC);
          tempTotal += tempCentegrade;
          tempCount++;

          if (tempCentegrade > max) {
            max = tempCentegrade;
          }

          if (tempCentegrade < min) {
            min = tempCentegrade;
          }
        }
        catch (error) {
          console.log(error);
        }
      });

      helpers.send_success(res, dailyResults);
      res.status(200);
    }

    res.end();
  });
}
