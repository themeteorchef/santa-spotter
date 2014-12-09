/*
*  Startup
*  Functions to run when the Meteor client starts up.
*/

Meteor.startup(function(){
  // Load Mapbox onto the client.
  Mapbox.load();
});
