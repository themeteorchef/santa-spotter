Meteor.publish('santaStops', function(){
  return Stops.find({"current": true}, {fields: {
      "current": 1,
      "longitude": 1,
      "latitude": 1,
      "name": 1
    }
  });
});
