Meteor.methods({

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
