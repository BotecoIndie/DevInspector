window.onload = function(){
  sendPost('get-progress');
  sendPost('get-devs');
};

function createProgressDiv(obj)
{
  var template = $("[name~=progress-template]")[0].innerHTML;
  var render = Mustache.render(template, {
    url: obj.url,
    username: obj.username,
    date: obj.date,
    avatar: obj.avatar
  });
  $(".progress-container").append($(render));
}

function deleteProgressDiv(url)
{
  var idd = document.getElementById(url);
  idd.outerHTML = "";
  delete idd;
}


function sendPost(type, url)
{
  switch(type)
  {
    case 'approve':
    $.ajax({
      type: "POST",
      url:'/approve',
      data: {
        url: url
      },
    }).done(function(data) {
      deleteProgressDiv(url);
    });
    break;
    case 'recuse':
    $.ajax({
      type: "POST",
      url:'/recuse',
      data: {
        url: url
      },
    }).done(function(data) {
      deleteProgressDiv(url);
    });
    break;
    case 'get-progress':
    $.ajax({
      type: "POST",
      url:'/get-progress',
      data: {
      },
    }).done(function(data) {
      for(var i = 0; i < data.length; i++)
      {
        createProgressDiv({
          url: data[i].url,
          username: data[i].author,
          date: data[i].postTime,
          avatar: data[i].authorAvatar
        });
      }
    });
    break;
  }
}
