console.log('hi');

var user;
var pass;

document.addEventListener('DOMContentLoaded', function() {
    var link = document.getElementById('submitAnswers');
    // onClick's logic below:
    link.addEventListener('click', function() {
      user = document.getElementById('inputEmail').value;
      pass = document.getElementById('inputPassword').value;
      alert(user+pass);
    });
});
