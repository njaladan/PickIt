let user;
let pass;

document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get('userId', function(items) {
    var userId = items.userId;
    if (userId) {
      $('#message').show();
      $('#message').text("Logged in");
      $('#inputForm').hide();
      $('#logout').show();
    } else {
      $('#logout').hide();
      $('#message').hide();
    }
  });
  
  $('#submit').click(function() {
    user = $('#inputUsername').val();
    pass = $('#inputPassword').val();
    $.get('http://localhost:3000/api/login/ext', {'username':user, 'password':pass}, (data) => {
      $('#message').show();
      if (data) {
        userId = data;
        chrome.storage.local.set({'userId':data});
        $('#message').text("Logged in as " + user);
        $('#inputForm').hide();
        $('#logout').show();
      } else {
        $('#message').text("Invalid username or password");
      }
    });
  });

  $('#logout').click(function() {
    chrome.storage.local.set({'userId': ''});
    $('#message').hide();
    $('#inputForm').show();
    $('#logout').hide();
  });
});

