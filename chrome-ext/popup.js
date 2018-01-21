console.log('hi');

var user;
var pass;
var userId;

document.addEventListener('DOMContentLoaded', function() {
    var link = document.getElementById('submitAnswers');
    // onClick's logic below:
    link.addEventListener('click', function() {
      user = document.getElementById('inputEmail').value;
      pass = document.getElementById('inputPassword').value;

      $.get('http://localhost:3000/api/login/ext', {'username':user, 'password':pass}, function(data){
          if(data){
            userId = data;
            chrome.storage.local.set({'userId':data},()=>{alert("cookies set")});
            document.getElementById('error').innerHTML("yay");
          } else {
            document.getElementById('error').innerHTML("wrong password");
          }
      });
    });
});
//
