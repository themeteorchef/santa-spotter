Meteor.startup(function(){

  /*
  * Load Santa's Stops
  * Pulls in the list of Santa's stops automatically on startup.
  */

  // Pull in Santa's stops.
  var stops = SANTA_STOPS;

  // Loop through array of user accounts.
  for(i=0; i < stops.length; i++){
    // Check if the user already exists in the DB.
    var stop      = stops[i],
        checkStop = Stops.findOne({"name": stop.name});

    // If the stop isn't found, add it to the collection.
    if( !checkStop ){
      Stops.insert(stop);
    }
  }

  /*
  * Setup Cron Jobs
  * Ensure that our clock at the North Pole is in sync with Santa's sleigh.
  */

  // Ensure that our clock is using UTC time. Think globally!
  SyncedCron.options = {
    log: true,
    collectionName: 'santaSchedule',
    utc: true
  }

  // Create two jobs: one to start Santa's journey on time (he'll use the signal
  // from our app to know when to start) and another to ping his sleigh to get
  // his current location every few minutes.

  // Start present delivery/location tracking.
  SyncedCron.add({
    name: 'TMC_SANTA_START_001',
    schedule: function(parser) {
      return parser.recur().on(12).month().on(21).dayOfMonth().on('22:08:00').time();
    },
    job: function() {
      Meteor.call('startPresentDelivery');
    }
  });

  // Ensure that our Cron jobs fire on schedule so presents are on time!
  SyncedCron.start();

});
