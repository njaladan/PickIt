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
  window.open(imgsrc, '_blank');
};
