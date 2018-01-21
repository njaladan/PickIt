console.log('hi');

var user;
var pass;

document.addEventListener('DOMContentLoaded', function() {
    var link = document.getElementById('submit_button');
    // onClick's logic below:
    console.log(link);
    link.addEventListener('click', function() {
      user = document.getElementById('user').value;
      pass = document.getElementById('pass').value;
      document.getElementById('invisible').innerHTML = user;
      alert(user+pass);
    });
});
