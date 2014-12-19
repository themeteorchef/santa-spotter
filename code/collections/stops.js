Stops = new Meteor.Collection('stops');

/*
* Allow
*/

Stops.allow({
  insert: function(){
    return false;
  },
  update: function(){
    return false;
  },
  remove: function(){
    return false;
  }
});
