Template.santaModal.helpers({
  currentQuestion: function(){
    var modal = Session.get('santaInfoModal');
    switch( modal ){
      case "whole-world":
        return {
          icon: SANTA_INFO[0].icon,
          question: SANTA_INFO[0].question,
          answer: SANTA_INFO[0].answer
        }
        break;
      case "chimney":
        return {
          icon: SANTA_INFO[1].icon,
          question: SANTA_INFO[1].question,
          answer: SANTA_INFO[1].answer
        }
        break;
      case "florida":
        return {
          icon: SANTA_INFO[2].icon,
          question: SANTA_INFO[2].question,
          answer: SANTA_INFO[2].answer
        }
        break;
      case "reindeer":
        return {
          icon: SANTA_INFO[3].icon,
          question: SANTA_INFO[3].question,
          answer: SANTA_INFO[3].answer
        }
        break;
      case "mail-order":
        return {
          icon: SANTA_INFO[4].icon,
          question: SANTA_INFO[4].question,
          answer: SANTA_INFO[4].answer
        }
        break;
      case "cookies":
        return {
          icon: SANTA_INFO[5].icon,
          question: SANTA_INFO[5].question,
          answer: SANTA_INFO[5].answer
        }
        break;
    }
  }
});
