//display default weather card
displayCard();
$(".updateLikes").on('click', confirmLike);
$(".updateDislikes").on('click', confirmDislike);

function confirmLike() {
  let postId = $(this).attr("id");
  likeFunction(postId);
}

function confirmDislike() {
  let postId = $(this).attr("id");
  dislikeFunction(postId);
}
async function likeFunction(pId) {
	let postId = pId;
  let url = "/feed/likes/add";
  location.reload();
  let response = await fetch(url,
    {
      method: 'post',
      body: JSON.stringify({
        "postId": postId
      }),
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });
  let data = await response.json();
}
async function dislikeFunction(pId) {
  let postId = pId;
  let url = "/feed/dislikes/add";
  location.reload();
  let response = await fetch(url,
    {
      method: 'post',
      body: JSON.stringify({
        "postId": postId
      }),
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });
  let data = await response.json();

}
function changeColour(e) {
  var el = e.target;
  var x = document.getElementsByClassName("card");
  var n = document.getElementsByClassName("name");
  var p = document.getElementsByClassName("para");
  var d = document.getElementsByClassName("date");
  var l = document.getElementsByClassName("likeC");
  var dis = document.getElementsByClassName("likeD");
  switch (el.nextSibling.nodeValue.toLowerCase()[0]) {
    case 'l':
      for (var i = 0; i < x.length; i++) {
        x[i].style.backgroundColor = 'white';
        n[i].style.color = 'black';
        p[i].style.color = 'black';
        d[i].style.color = 'black';
        l[i].style.color = 'black';
        dis[i].style.color = 'black';
      }
      break;
    case 'd':
      for (var i = 0; i < x.length; i++) {
        x[i].style.backgroundColor = 'black';
        n[i].style.color = 'white';
        p[i].style.color = 'white';
        d[i].style.color = 'white';
        l[i].style.color = 'white';
        dis[i].style.color = 'white';
      }
      break;
    case 's':
      location.reload();
      break;
  }
}
document.getElementById('postMode').addEventListener('change', changeColour, true);

async function displayCard() {
  let url = `https://api.openweathermap.org/data/2.5/weather?q=Seaside&appid=586f372cba42eef1e6670bf216523b48`;
  let data = await getData(url);
  $("#n").html(data.name);
  $("#d").html(data.weather[0].description);
  var iconcode = data.weather[0].icon;
  var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
  $('#w').attr('src', iconurl);

  //faren
  let kelvin = parseInt(data.main.temp);
  let step1 = kelvin - 273;
  let step2 = 1.8 * step1;
  let step3 = step2 + 33;
  $("#far").html(Math.round(step3) + "F");
}
async function getData(url) {
  let response = await fetch(url);
  let data = await response.json();
  return data;
}