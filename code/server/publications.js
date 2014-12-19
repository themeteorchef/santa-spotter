Meteor.publish('santaStops', function(){
  return Stops.find();
});
