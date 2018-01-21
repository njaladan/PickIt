function cleanString(str) {
  let newStr = "";
  let i = 0;
  while (i < str.length) {
    if (str[i].match(/[a-z]/i)) {
      newStr += str[i];
    } else {
      break;
    }
    i += 1;
  }
  return newStr;
}

$(document).ready(function() {
  $('.tagBtn').click(function() {
    const inputField = $(this).parent().prev('input');
    const imageId = inputField.attr('id');
    const newTag = cleanString(inputField.val());
    
    if (newTag.length > 0) {
       $.post('/api/addtag', {imageId: imageId, tag: newTag}, (data) => {
         location.reload();
       });
    }
  });

  $('.delBtn').click(function() {
    const inputField = $(this).parent().prev('input');
    const imageId = inputField.attr('id');
    $.post('/api/deltags', {imageId: imageId}, (data) => {
      location.reload();
    });
  });

  $('#searchBtn').click(function() {
    const inputField = $(this).parent().prev('input');
    const tag = cleanString(inputField.val());
    $.post('/api/searchtag', {tag: tag}, (data) => {
      location.reload();
    });
  });

  $('#clearBtn').click(function() {
    $.post('/api/cleartags', {}, (data) => {
      location.reload();
    });
  });
});
