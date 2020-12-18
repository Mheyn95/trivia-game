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

// function to get question data based on user selections USE LOCAL STORAGE TO RETRIEVE PAST TOKEN AND PASS INTO FUNCTION
var getQuestionsData = function (token) {
  var difficulty = "easy";
  var type = "multiple";
  var category = 12;
  token = "e20155578648e4bb2796841720d067872a4177a19173885b4ad73e08ff318274";
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
            return;
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
              // we will need to increase this when we move on from each question
              var questionCount = 0;
              //add the object to the array
              questions.push(questionObj);
            }
            //randomize order of questions in the array
            for (let i = questions.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [questions[i], questions[j]] = [questions[j], questions[i]];
            }
            console.log(questions);
            displayQuestions(questions, questionCount);
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

// get our questionObj array and put it on the page
var displayQuestions = function (questions, questionCount) {
  // create the question text h2 element give it a class for now and append it to html container(id=question for now)
  var currentQuestion = document.createElement("h2");
  currentQuestion.classList = "current-question";
  currentQuestion.innerHTML = questions[questionCount].question;
  $("#question").append(currentQuestion);
  // create div to hold answers, give it a class for now
  var currentAnswerSetContainer = document.createElement("div");
  currentAnswerSetContainer.classList = "current-answer-container";
  // create answer btns and append them to the container, give each one a class for now
  for (i = 0; i < questions[questionCount].answers.length; i++) {
    var currentAnswer = document.createElement("button");
    currentAnswer.classList = "current-answer";
    currentAnswer.setAttribute("data-val", questions[questionCount].answers[i]);
    currentAnswer.innerHTML = questions[questionCount].answers[i];
    currentAnswerSetContainer.append(currentAnswer);

    currentAnswer.onclick = function () {
      if (
        this.getAttribute("data-val") === questions[questionCount].correctAnswer
      ) {
        alert("You are right");
      } else {
        alert("You are wrong");
      }
      $("#question").empty();
      questionCount = questionCount + 1;
      console.log(questionCount);
      if (questionCount < questions.length) {
        displayQuestions(questions, questionCount);
      } else {
        alert("Quiz is over!");
        return;
      }
    };
  }
  // append the container to the html container(id=question for now)
  $("#question").append(currentAnswerSetContainer);
};

getQuestionsData();
