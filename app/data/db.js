var sqlite3 = require('sqlite3').verbose();

exports.db = function(callback) {
    var conn = new sqlite3.Database('/home/pi/MyCode/nodejs/weather-iot/app/data/Weather.db');
    callback(null, conn);
};


 