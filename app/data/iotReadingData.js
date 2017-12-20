var db = require('./db.js'),
    backhelp = require("./backend_helpers.js"),
    async = require('async');

exports.create_session = function (session, callback) {
    var qry;
    var dbc;

    async.waterfall([
        function (cb) {
            db.db(cb);
        },

        function (dbClient, cb) {
            dbc = dbClient;
            try {

                dbc.serialize(() => {
                    var qry = dbc.prepare("INSERT INTO IotSessions (SessionDate) values (?)");
                    qry.run(session.SessionDate, function (err) {
                        if (err) {
                            //success = false;
                            throw backhelp.sql_error(err);
                        }
                        session.IotSessionId = this.lastID;
                        console.log("New IotSessionId : " + session.IotSessionId);
                        
                        qry.finalize();

                        cb(null, session);

                    });

                });
            }
            catch (e) {
                cb(e);
                return;
            }
        },

        function (session, cb) {

            try {
                dbc.serialize(() => {
                    qry = dbc.prepare("INSERT INTO IotReadings (IotSessionId, PropertyName, PropertyValue) values (?,?,?)");
                     console.log("Writing IotReadings for IotSessionId : " + session.IotSessionId);

                    for (var i in session.IotReadings) {
                        var reading = session.IotReadings[i];

                        qry.run([session.IotSessionId,
                        reading.PropertyName,
                        reading.PropertyValue],
                            function (err) {
                                if (err) {
                                    //success = false;
                                    throw backhelp.sql_error(err);
                                }
                            }
                        );

                    }
                    qry.finalize();
                });
                cb(null, session);  //is this correct? returns to this line after res.end
            }
            catch (e) {
                cb(e);
                return;
            }
        }
    ],
        function (err, results) {

            if (err) {
                callback(err);
            } else {
                callback(err, err ? null : results);
            }

            console.log("SUCCESS : IOT Sensor Readings written to database.")
            dbc.close();
        });


};

exports.get_latest_session_data = function (callback) {

    var qry;
    var dbc;

    async.waterfall([
        function (cb) {
            db.db(cb);
        },

        function (dbClient, cb) {
            dbc = dbClient;
            try {

                dbc.serialize(() => {
                    var sql = "SELECT * \
                    FROM IotSessions s \
                    INNER JOIN IotReadings r ON r.IotSessionId = s.IotSessionId \
                    WHERE s.IotSessionId = (SELECT MAX(IotSessionId) FROM IotSessions)";
                    var qry = dbc.all(sql, [], (err, rows) => {
                        if (err) {
                            throw backhelp.sql_error(err);
                        }

                        cb(null, rows);

                    });
                });
            }
            catch (e) {
                cb(e);
                return;
            }
        },
    ],
        function (err, results) {

            if (err) {
                callback(err);
            } else {
                callback(err, err ? null : results);
            }

            dbc.close();
        });

    }; 

     exports.get_all_session_data = function (callback) {

    var qry;
    var dbc;

    async.waterfall([
        function (cb) {
            db.db(cb);
        },

        function (dbClient, cb) {
            dbc = dbClient;
            try {

                dbc.serialize(() => {
                    var sql = "SELECT * \
                    FROM IotSessions s \
                    INNER JOIN IotReadings r ON r.IotSessionId = s.IotSessionId \
                    ORDER BY s.SessionDate ASC";
                    var qry = dbc.all(sql, [], (err, rows) => {
                        if (err) {
                            throw backhelp.sql_error(err);
                        }

                        cb(null, rows);

                    });
                });
            }
            catch (e) {
                cb(e);
                return;
            }
        },
    ],
        function (err, results) {

            if (err) {
                callback(err);
            } else {
                callback(err, err ? null : results);
            }

            dbc.close();
        });

};    
   
