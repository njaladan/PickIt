let user;
let pass;

document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get('username', function(items) {
    var username = items.username;
    if (username) {
      $('#message').show();
      $('#message').text("Logged in as " + username);
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
        chrome.storage.local.set({'userId':data});
        chrome.storage.local.set({'username': user});
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
    chrome.storage.local.set({'username': ''});
    $('#message').hide();
    $('#inputForm').show();
    $('#logout').hide();
  });
});

