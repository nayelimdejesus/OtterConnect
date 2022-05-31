display();
document.getElementById("mybutton").addEventListener("click", displayInfo);

async function display() {
  let url = `https://api.openweathermap.org/data/2.5/weather?q=Seaside&appid=586f372cba42eef1e6670bf216523b48`;
  let data = await getData(url);

  $("#name").html(data.name);
  $("#desc").html("Description: " + data.weather[0].description);
  $("#hum").html("Humidity: " + data.main.humidity + "%");

  var iconcode = data.weather[0].icon;
  var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
  $('#wicon').attr('src', iconurl);

  //gets the farengihght
  let kelvin = parseInt(data.main.temp);
  let step1 = kelvin - 273;
  let step2 = 1.8 * step1;
  let step3 = step2 + 33;

  $("#f").html("Temperature: " + Math.round(step3) + "F");

  //get's the farenheight
  let k = parseInt(data.main.feels_like);
  let s1 = k - 273;
  let s2 = 1.8 * s1;
  let s3 = s2 + 33;
  $("#fF").html("Temperature feels like: " + Math.round(s3) + "F");
}

async function displayInfo() {
  let textInput = $("#inputValue").val();
  if (textInput == "") {
    document.getElementById('wicon').style.display = 'none';
    $("#error").html("City name is required.");
    $("#name").html("");
    $("#desc").html("");
    $("#hum").html("");
    $("#f").html("");
    $("#fF").html("");
  }
  else if (Number.isInteger(parseInt(textInput)) == true) {
    document.getElementById('wicon').style.display = 'none';
    $("#error").html("Error: Enter city name!");
    $("#name").html("");
    $("#desc").html("");
    $("#hum").html("");
    $("#f").html("");
    $("#fF").html("");
  }
  else {
    $("#error").html("");
    let url = `https://api.openweathermap.org/data/2.5/weather?q=` + inputValue.value + `&appid=586f372cba42eef1e6670bf216523b48`;

    let data = await getData(url);
    document.getElementById('wicon').style.display = 'inline';
    if (data.message != "city not found") {
      $("#name").html(data.name);
      $("#desc").html("Description: " + data.weather[0].description);
      $("#hum").html("Humidity: " + data.main.humidity + "%");
      var iconcode = data.weather[0].icon;
      var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
      $('#wicon').attr('src', iconurl);

      //gets the farengihght
      let kelvin = parseInt(data.main.temp);
      let step1 = kelvin - 273;
      let step2 = 1.8 * step1;
      let step3 = step2 + 33;

      $("#f").html("Temperature: " + Math.round(step3) + "F");

      //get's the farenheight
      let k = parseInt(data.main.feels_like);
      let s1 = k - 273;
      let s2 = 1.8 * s1;
      let s3 = s2 + 33;
      $("#fF").html("Temperature feels like: " + Math.round(s3) + "F");
    }
    else {
      document.getElementById('wicon').style.display = 'none';
      $("#error").html("City does not exist.");
      $("#name").html("");
      $("#desc").html("");
      $("#hum").html("");
      $("#f").html("");
      $("#fF").html("");
    }
  }
}

async function getData(url) {
  let response = await fetch(url);
  let data = await response.json();
  return data;
}