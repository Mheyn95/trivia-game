// generate session token to make sure the same questions will not be reused, unless they run out
var generateToken = function () {
  var apiUrl = "https://opentdb.com/api_token.php?command=request";
  fetch(apiUrl)
    .then(function (response) {
      // request was successful
      if (response.ok) {
        response.json().then(function (data) {
          saveToken(data.token);
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

// save token to local storage
var saveToken = function (token) {
  // clear out current value
  localStorage.removeItem("token");

  // push token into localstorage
  localStorage.setItem("token", token);
};

// check if token exists in local storage
var getToken = function () {
  var token = localStorage.getItem("token");
  if (!token) {
    generateToken();
  }
};

// function to be used if we get a repsonse from api that tells us we ran out of unique questions, this will reset the token so old questions can be used again
var resetToken = function (difficulty, type, category, token) {
  var apiUrl = "https://opentdb.com/api_token.php?command=reset&token=" + token;
  fetch(apiUrl)
    .then(function (response) {
      // request was successful
      if (response.ok) {
        response.json().then(function (data) {
          getQuestionsData(difficulty, type, category, token);
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

// function to get question data based on user selections and to start and display timer
var getQuestionsData = function (difficulty, type, category, token) {
  var apiUrl =
    "https://opentdb.com/api.php?amount=10" +
    category +
    difficulty +
    type +
    "&token=" +
    token;

  console.log(apiUrl);
  fetch(apiUrl)
    .then(function (response) {
      // request was successful
      if (response.ok) {
        response.json().then(function (data) {
          // check if we need to reset token
          if (data.response_code === 4) {
            resetToken(difficulty, type, category, token);
            // check to see if the session token is valid, if it is not generate a new one and run function again
          } else if (data.response_code === 3) {
            generateToken();
            var token = localStorage.getItem("token");
            getQuestionsData(difficulty, type, category, token);
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

  // set where to start the timer
  var timeLeft = 120;

  // initiate timer
  var timeCounter = setInterval(function () {
    if (timeLeft < 1) {
      clearInterval(timeCounter);
      $("#timer-ctn").empty();
      return;
    }
    $("#timer-ctn").empty();
    var timerDiv = document.createElement("p");
    timerDiv.textContent = "Time Remaing: " + timeLeft + " seconds";
    $("#timer-ctn").append(timerDiv);
    timeLeft--;
  }, 1000);
};

// get gifs for thumbs up(question right) and thumbs down(question wrong) from the giphy api.
// var getGifs = function () {
//   //get thumbs up gif
//   var apiUrl =
//     "https://api.giphy.com/v1/gifs/111ebonMs90YLu?api_key=s41LdJZmruKfK6XHNXkpp7s8fFJ70xnE";
//   fetch(apiUrl)
//     .then(function (response) {
//       // request was successful
//       if (response.ok) {
//         response.json().then(function (data) {
//           var rightUrl = data.data.images.original.url;
//         });
//       } else {
//         alert("Error: " + response.statusText);
//         return;
//       }
//     })
//     .catch(function (error) {
//       alert("Unable to connect to api");
//     });

//   //get thumbs down gif
//   apiUrl =
//     "https://api.giphy.com/v1/gifs/qiDb8McXyj6Eg?api_key=s41LdJZmruKfK6XHNXkpp7s8fFJ70xnE";
//   fetch(apiUrl)
//     .then(function (response) {
//       // request was successful
//       if (response.ok) {
//         response.json().then(function (data) {
//           var wrongUrl = data.data.images.original.url;
//         });
//       } else {
//         alert("Error: " + response.statusText);
//         return;
//       }
//     })
//     .catch(function (error) {
//       alert("Unable to connect to api");
//     });
// };

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
        var apiUrl =
          "https://api.giphy.com/v1/gifs/111ebonMs90YLu?api_key=s41LdJZmruKfK6XHNXkpp7s8fFJ70xnE";
        fetch(apiUrl)
          .then(function (response) {
            // request was successful
            if (response.ok) {
              response.json().then(function (data) {
                var rightUrl = data.data.images.original.url;
                var gifImgEl = document.createElement("img");
                gifImgEl.setAttribute("src", rightUrl);
                $("#gif-ctn").append(gifImgEl);
              });
            } else {
              alert("Error: " + response.statusText);
              return;
            }
          })
          .catch(function (error) {
            alert("Unable to connect to api");
          });
      } else {
        alert("You are wrong");
        //get thumbs down gif
        apiUrl =
          "https://api.giphy.com/v1/gifs/qiDb8McXyj6Eg?api_key=s41LdJZmruKfK6XHNXkpp7s8fFJ70xnE";
        fetch(apiUrl)
          .then(function (response) {
            // request was successful
            if (response.ok) {
              response.json().then(function (data) {
                var wrongUrl = data.data.images.original.url;
                var gifImgEl = document.createElement("img");
                gifImgEl.setAttribute("src", wrongUrl);
                $("#gif-ctn").append(gifImgEl);
              });
            } else {
              alert("Error: " + response.statusText);
              return;
            }
          })
          .catch(function (error) {
            alert("Unable to connect to api");
          });
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

// get and fills out category
var generateCategory = function () {
  var categoryUrl = "https://opentdb.com/api_category.php";

  fetch(categoryUrl)
    .then(function (categoryResponse) {
      if (categoryResponse.ok) {
        return categoryResponse.json();
      } else {
        alert("Error: " + categoryResponse.statusText);
      }
    })
    .then(function (categoryResponse) {
      var categorySelectEl = document.getElementById("categorySelect");
      for (var i = 0; i < categoryResponse.trivia_categories.length; i++) {
        var optionEl = document.createElement("option");
        optionEl.innerHTML = categoryResponse.trivia_categories[i].name;
        optionEl.setAttribute("id", categoryResponse.trivia_categories[i].id);
        categorySelectEl.appendChild(optionEl);
      }
    })
    .catch(function (error) {
      alert("Unable to connect to Trivia API");
    });
};

// open modal
$("#start-btn").on("click", function () {
  $("#start-modal").addClass("is-active is-clipped");
  generateCategory();
});

//close modal
$("#start-modal .close").on("click", function () {
  $("#start-modal").removeClass("is-active is-clipped");
});

// submit user selections in modal to the api call
$("#start-modal .is-success").on("click", function () {
  // get user inputs from the modal and store them to get put into the api call

  var difficulty = "";
  if ($("#difficultySelect").val() != "Any Difficulty") {
    difficulty = "&difficulty=" + $("#difficultySelect").val().toLowerCase();
  }

  var type = "";
  if ($("#typeSelect").val() != "Any Type") {
    if ($("#typeSelect").val() === "Multiple Choice") {
      type = "&type=multiple";
    } else {
      type = "&type=boolean";
    }
  }

  var category = "";
  if ($("#categorySelect").val() != "Any Category") {
    category =
      "&category=" + $("#categorySelect").find("option:selected").attr("id");
  }

  var token = localStorage.getItem("token");

  // hide the modal so we can take the quiz
  $("#start-modal").removeClass("is-active is-clipped");
  // run function to start the quiz with the stored user inputs
  getQuestionsData(difficulty, type, category, token);
});

// call function to generate a session token if there is not a token in local storage
getToken();
