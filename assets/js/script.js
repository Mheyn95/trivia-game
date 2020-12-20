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

// function to get question data based on user selections
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

$("#start-btn").on("click", function () {
  $("#start-modal").addClass("is-active is-clipped");
  generateCategory();
});

$("#start-modal .close").on("click", function () {
  $("#start-modal").removeClass("is-active is-clipped");
});

$("#start-modal .is-success").on("click", function () {
  var difficulty = "";
  if ($("#difficultySelect").val() != "Any Difficulty") {
    difficulty = $("#difficultySelect").val();
    difficulty = difficulty.toLowerCase();
    difficulty = "&difficulty=" + difficulty;
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
    switch ($("#categorySelect").val()) {
      case "General Knowledge":
        category = 9;
        break;
      case "Entertainment: Books":
        category = 10;
        break;
      case "Entertainment: Film":
        category = 11;
        break;
      case "Entertainment: Music":
        category = 12;
        break;
      case "Entertainment: Musicals and Theatres":
        category = 13;
        break;
      case "Entertainment: Television":
        category = 14;
        break;
      case "Entertainment: Video Games":
        category = 15;
        break;
      case "Entertainment: Board Games":
        category = 16;
        break;
      case "Science and Nature":
        category = 17;
        break;
      case "Science: Computers":
        category = 18;
        break;
      case "Science: Mathematics":
        category = 19;
        break;
      case "Mythology":
        category = 20;
        break;
      case "Sports":
        category = 21;
        break;
      case "Geography":
        category = 22;
        break;
      case "History":
        category = 23;
        break;
      case "Politics":
        category = 24;
        break;
      case "Art":
        category = 25;
        break;
      case "Celebrities":
        category = 26;
        break;
      case "Animals":
        category = 27;
        break;
      case "Vehicles":
        category = 28;
        break;
      case "Entertainment: Comics":
        category = 29;
        break;
      case "Science: Gadgets":
        category = 30;
        break;
      case "Entertainment: Japanese Anime and Manga":
        category = 31;
        break;
      case "Entertainment: Cartoon and Animations":
        category = 32;
        break;
    }
    category = "&category=" + category;
  }

  var token = localStorage.getItem("token");
  $("#start-modal").removeClass("is-active is-clipped");
  getQuestionsData(difficulty, type, category, token);
});

getToken();
