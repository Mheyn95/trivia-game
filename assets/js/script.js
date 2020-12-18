var generateToken = function () {
  var apiUrl = "https://opentdb.com/api_token.php?command=request";
  fetch(apiUrl)
    .then(function (response) {
      // request was successful
      if (response.ok) {
        response.json().then(function (data) {
          getQuestionsData(data.token);
        });
      } else {
        alert("Error: " + response.statusText);
        return;
      }
    })
    .catch(function (error) {
      alert("Unable to connect to api");
    });
};

var resetToken = function (token) {
  var apiUrl = "https://opentdb.com/api_token.php?command=reset&token=" + token;
  fetch(apiUrl)
    .then(function (response) {
      // request was successful
      if (response.ok) {
        response.json().then(function (data) {
          getQuestionsData(token);
        });
      } else {
        alert("Error: " + response.statusText);
        return;
      }
    })
    .catch(function (error) {
      alert("Unable to connect to api");
    });
};

var getQuestionsData = function (token) {
  var difficulty = "easy";
  var type = "multiple";
  var apiUrl =
    "https://opentdb.com/api.php?amount=10&category=" +
    12 +
    "&difficulty=" +
    difficulty +
    "&type=" +
    type +
    "&token=" +
    token;
  fetch(apiUrl)
    .then(function (response) {
      // request was successful
      if (response.ok) {
        response.json().then(function (data) {
          if (data.response_code === 4) {
            resetToken(token);
          } else {
            console.log(data);
          }
        });
      } else {
        alert("Error: " + response.statusText);
        return;
      }
    })
    .catch(function (error) {
      alert("Unable to connect to api");
    });
};
// var getGifs = function () {};
