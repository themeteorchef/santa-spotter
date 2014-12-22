Template.learnAboutSanta.events({
  'click .tips a': function(e){
    var target = $(e.target),
        modal  = target.data('id');
        
    Session.set('santaInfoModal', modal);
  }
});
