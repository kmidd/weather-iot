// var Vue = require('vue');

new Vue({
  el: '#weather',

  data: {
    sessions: [],
    session: null
  },

  mounted: function () {
    this.getIotSessions();
    this.getLatestIotSessions();
  },

  methods: {

    getLatestIotSessions: function () {
      var iotSessions = [];
      // this.$set('events', events);
      this.$http.get('/iot/readings/latest')
        .then(response => {
          var sess = response.body.data.sessions[0];

          this.session = { SessionDate: sess.SessionDate };

          for (var reading of sess.IotReadings) {
            this.session[reading.PropertyName] = reading.PropertyValue;
          }

          console.log("Got latest session");

        }, response => {
          // error callback
          console.log(response.body);

        });

    },

    getIotSessions: function () {
      this.$http.get('/iot/readings')
        .then(response => {
          // this.$set(this.sessions, 'sessions', response.body.data.sessions);
          this.sessions = [];
          for (var sess of response.body.data.sessions) {
            if (!sess) { continue; }
            var readings = { SessionDate: sess.SessionDate };

            for (var reading of sess.IotReadings) {
              readings[reading.PropertyName] = reading.PropertyValue;
            }

            this.sessions.push(readings);
          }
          console.log("Got sessions");

        }, response => {
          // error callback
          console.log(response.body);

        });


    },

    deleteEvent: function (index) {
      if (confirm('Delete event？')) {
        // this.events.splice(index, 1);
        this.$http.delete('api/events/' + event.id)
          .success(function (res) {
            console.log(res);
            this.events.splice(index, 1);
          })
          .error(function (err) {
            console.log(err);
          });
      }
    }
  }
});
