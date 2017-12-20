

exports.error = function (code, message) {
    var e = new Error(message);
    e.code = code;
    return e;
};

exports.sql_error = function (err) {
    return exports.error("sql_error",
    err.code + " : " + err.message);
};

