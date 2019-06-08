var sqlite3 = require('sqlite3').verbose();

var db   = new sqlite3.Database('./Weather.db');

create_db();

function create_db() {

  db.serialize( () => {

    db.run('drop table if exists IotSessions');
    db.run('create table if not exists '
          + 'IotSessions ('
          + 'IotSessionId INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, '
          + 'SessionDate DATETIME)'
          );

    db.run('drop table if exists IotReadings');
    db.run('create table if not exists '
          + 'IotReadings ('
          + 'IotReadingsld INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, '
          + 'IotSessionId INTEGER NOT NULL, '
          + 'PropertyName TEXT,'
          + 'PropertyValue TEXT)'
          );
    
    console.log('IOT database created!')

  });
}