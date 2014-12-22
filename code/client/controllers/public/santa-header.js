Template.santaHeader.helpers({

  currentLocation: function(){
    var getLocation = Stops.findOne({"current": true}, {fields: {"name": 1}});
    if ( getLocation ) {
      return getLocation.name;
    } else {
      return "Locating...";
    }
  }

});
