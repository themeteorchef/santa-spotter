Meteor.methods({

  startPresentDelivery: function(){
    // Ping sleigh for current location.
    SyncedCron.add({
      name: 'Deliver Presents',
      schedule: function(parser) {
        return parser.text('every 10 seconds');
      },
      job: function() {
        Meteor.call('updateSantaLocation');
      }
    });
  },

  updateSantaLocation: function(){
    // Get the current stop from the database, check its order, and update the
    // next item to be the "current" stop. Only do this if we're not on the last
    // item in our list, otherwise, we can stop and delete our cron job.
    var currentStop = Stops.findOne({"current": true}),
        csIndex     = currentStop.order,
        nextStop    = Stops.findOne({"order": csIndex + 1});

    if ( csIndex != 333 ) {
      Stops.update(currentStop._id,{
        $set: {
          "current": false
        }
      }, function(error){
        if(error) {
          console.log(error);
        }
      });

      Stops.update(nextStop._id,{
        $set: {
          "current": true
        }
      }, function(error){
        if(error) {
          console.log(error);
        }
      });
    } else {
      SyncedCron.remove('Deliver Presents');
    }
  }

});
