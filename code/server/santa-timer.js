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

    var currentStop = Stops.findOne({"current": true}),
        csIndex     = currentStop.order,
        nextStop    = Stops.findOne({"order": csIndex + 1});

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

  }

});
