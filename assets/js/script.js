// generate session token to make sure the same questions will not be reused, unless they run out
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

// function to be used if we get a repsonse from api that tells us we ran out of unique questions, this will reset the token so old questions can be used again
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

// function to get question data based on user selections
var getQuestionsData = function (token) {
  var difficulty = "easy";
  var type = "multiple";
  var category = 12;
  var apiUrl =
    "https://opentdb.com/api.php?amount=10&category=" +
    category +
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
          // check if we need to reset token
          if (data.response_code === 4) {
            resetToken(token);
            // check if there are enough questions for the current request
          } else if (data.response_code === 1) {
            alert(
              "Sorry, not enough questions, please change your selections!"
            );
          } else {
            // get array of objects to hold the data we need
            var questions = [];
            for (i = 0; i < data.results.length; i++) {
              var questionObj = {
                question: data.results[i].question,
                correctAnswer: data.results[i].correct_answer,
                answers: data.results[i].incorrect_answers,
              };
              //add the correct answer to the list of possible answers and randomize it
              questionObj.answers.push(questionObj.correctAnswer);
              for (let i = questionObj.answers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [questionObj.answers[i], questionObj.answers[j]] = [
                  questionObj.answers[j],
                  questionObj.answers[i],
                ];
              }
              //add the object to the array
              questions.push(questionObj);
            }
            //randomize order of questions in the array
            for (let i = questions.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [questions[i], questions[j]] = [questions[j], questions[i]];
            }
            console.log(questions);
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

// get gifs for thumbs up(question right) and thumbs down(question wrong) from the giphy api.
var getGifs = function () {
  //get thumbs up gif
  var apiUrl =
    "https://api.giphy.com/v1/gifs/111ebonMs90YLu?api_key=s41LdJZmruKfK6XHNXkpp7s8fFJ70xnE";
  fetch(apiUrl)
    .then(function (response) {
      // request was successful
      if (response.ok) {
        response.json().then(function (data) {
          console.log(data);
        });
      } else {
        alert("Error: " + response.statusText);
        return;
      }
    })
    .catch(function (error) {
      alert("Unable to connect to api");
    });

  //get thumbs down gif
  apiUrl =
    "https://api.giphy.com/v1/gifs/qiDb8McXyj6Eg?api_key=s41LdJZmruKfK6XHNXkpp7s8fFJ70xnE";
  fetch(apiUrl)
    .then(function (response) {
      // request was successful
      if (response.ok) {
        response.json().then(function (data) {
          console.log(data);
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
generateToken();
