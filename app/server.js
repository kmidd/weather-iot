var express = require('express');
var app = express();

var session_readings_hdlr = require('./handlers/iotSessionReadings.js');

var server = app.listen(8080, listening);

function listening() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Server is listening at http://' + host + ':' + port);
}

app.get('/iot/:station/readings', session_readings_hdlr.save_iot_session_data);  // TODO: change to post
app.get('/iot/readings/latest', session_readings_hdlr.get_latest_session_data);
app.get('/iot/readings/month/maxmin/:monthYear', session_readings_hdlr.getMaxMinByMonth);
app.get('/iot/readings', session_readings_hdlr.get_all_session_data);

app.use(express.static(__dirname + "/../static"));


