Template.santaFooter.helpers({

  sleighConnectionStatus: function(){
    var sleighStatus = Meteor.status().connected;
    if ( sleighStatus == true ){
      return "nice";
    } else if ( sleighStatus == false ) {
      return "naughty";
    } else {
      return "unknown";
    }
  }

});
