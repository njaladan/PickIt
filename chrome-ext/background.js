chrome.runtime.onInstalled.addListener(function() {
  var context = "image";
  var title = "PickIt";
  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                         "id": "context" + context});
});

// add click event
chrome.contextMenus.onClicked.addListener(onClickHandler);

// The onClicked callback function.
function onClickHandler(info, tab) {
  var imgsrc = info.srcUrl;

  chrome.storage.local.get('userId', function(items){
    var userId = items.userId;
    if (userId) {
      $.post("http://localhost:3000/api/newpic", {
          'awsKey':imgsrc,
          'title':'hardcoded title lmao',
          'userId': userId,
          'tags':[]
        },
        function(str){
          console.log('uploaded');
        });
    } else {
      console.log('bad id');
    }
  })

};
