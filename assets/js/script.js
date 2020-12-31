// get promptContent <p> to display prompts to the user
var promptContent = document.getElementById("promptContent");

// get countdown <p>
var questionHeaderEl = document.getElementById('questionsHeader');

// set global variables
var timeLimit = 120;
var playerName = "";
var score = 0;
var highscoreArray = [];
var token;
var questions = [];
// we will need to increase this when we move on from each question
var questionCount = 0;
var difficulty = "";
var type = "";
var category = "";
var timeInterval;

// start game
var startGame = function () {
  // hide start and high score buttons
  $("#start-btn").hide();
  $("#high-btn").hide();
  // start Timmer
  countdownTimer();
  // call function to generate a session token if there is not a token in local storage
  highscoreArray = [];
  loadHighscore();
  getToken();
  // token = localStorage.getItem("token");

  $("#questions-modal").addClass("is-active is-clipped");
  
  // get and display questions
  getQuestionsData();
};

var countdownTimer = function() {
  // start of the countdown timer
  timeInterval = setInterval(function () {
      if (timeLimit > 1) {
          // display timer and countdown
          questionHeaderEl.textContent = timeLimit + ' seconds remaining';
          // decrement 'timeLimit' by 1
          timeLimit--;
      }
      else if (timeLimit === 1) {
          // dispaly timer and countdown
          questionHeaderEl.textContent = timeLimit + ' second remaining';
          // decrement 'timeLimit' by 1
          timeLimit--;
      }
      else {
          // clear question items
          questionHeaderEl.textContent = '';
          // showQuestionEl.textContent = '';
          try {
              $('guestion-ctn').empty();
          }
          catch(err) {

          }
          
          // clear timer
          clearInterval(timeInterval);

          // run endGame function
          $("#question").empty();
          $("#questionBtns").empty();
          $("#gif-ctn").remove();
          endGame();
      }
  }, 1000)
}

// check if token exists in local storage
var getToken = function () {
  token = localStorage.getItem("token");
  if (!token) {
    generateToken();
  }
};

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
var saveToken = function () {
  // clear out current value
  localStorage.removeItem("token");

  // push token into localstorage
  localStorage.setItem("token", token);
  token = localStorage.getItem("token");
};

// function to be used if we get a repsonse from api that tells us we ran out of unique questions, this will reset the token so old questions can be used again
var resetToken = function () {
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
var getQuestionsData = function () {
  var apiUrl =
    "https://opentdb.com/api.php?amount=10" +
    category +
    difficulty +
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
            questions = [];
            for (i = 0; i < data.results.length; i++) {
              var questionObj = {
                question: data.results[i].question,
                correctAnswer: data.results[i].correct_answer,
                answers: data.results[i].incorrect_answers,
                difficulty: data.results[i].difficulty,
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
            displayQuestions();
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

// get our questionObj array and put it on the page
var displayQuestions = function () {
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
        if (difficulty === "&difficulty=easy") {
          score = score + 3;
        } else if (difficulty === "&difficulty=hard") {
          score = score + 10;
        } else {
          score = score + 5;
        }
        console.log(score);
        var apiUrl =
          "https://api.giphy.com/v1/gifs/111ebonMs90YLu?api_key=s41LdJZmruKfK6XHNXkpp7s8fFJ70xnE";
        fetch(apiUrl)
          .then(function (response) {
            // request was successful
            if (response.ok) {
              response.json().then(function (data) {
                $("#gif-ctn").empty();
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
        if (difficulty === "&difficulty=easy") {
          score = score - 1;
        } else if (difficulty === "&difficulty=hard") {
          score = score - 6;
        } else {
          score = score - 3;
        }
        console.log(score);
        //get thumbs down gif
        apiUrl =
          "https://api.giphy.com/v1/gifs/qiDb8McXyj6Eg?api_key=s41LdJZmruKfK6XHNXkpp7s8fFJ70xnE";
        fetch(apiUrl)
          .then(function (response) {
            // request was successful
            if (response.ok) {
              response.json().then(function (data) {
                $("#gif-ctn").empty();
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
      $("#questionBtns").empty();
      $("#gif-ctn").empty();

      questionCount = questionCount + 1;
      if (questionCount < questions.length) {
        displayQuestions();
      } else {
        $("#question").empty();
        $("#questionBtns").empty();
        $("#gif-ctn").remove();
        endGame();
        // return;
      }
    };
  }
  // append the container to the html container(id=question for now)
  $("#questionBtns").append(currentAnswerSetContainer);
  // append the current score below the question
  // var currentScore = document.createElement("p");
  // $('#score-ctn').textContent = playerName + " has a score of " + score;
  // $("#question").append(currentScore);
};

// end the game and display high scores
var endGame = function () {
  // timeLimit = 0;
  clearInterval(timeInterval);
  questionHeaderEl.textContent = 'High Scores'

  //set up our score display
  var newScoreObj = {
    name: playerName,
    score: score,
    // combo: name + " - " + score,
  };

  highscoreArray.push(newScoreObj);
  localStorage.setItem("scores", JSON.stringify(highscoreArray));
  showHighscore();

  // loadHighscore();
  // pull all scores from localStorage
  // var scores = localStorage.getItem("scores");
  // if (!scores) {
  //   scores = [newScoreObj];
  // } else {
  //   scores = JSON.parse(scores);
  //   scores.push(newScoreObj);
  //   scores.sort((a, b) => (a.score > b.score ? 1 : -1));
  // }

  // // store all scores back into localStorage
  // localStorage.setItem("scores", JSON.stringify(scores));

  // // display all scores on the page
  // for (i = 0; i < scores.length; i++) {
  //   var scoreLi = document.createElement("li");
  //   scoreLi.textContent = scores[i].name + ': ' + scores[i].score;
  //   $("#score-ctn").prepend(scoreLi);
  // }
};

var showHighscore = function() {
  // get the highscores from localStorage for display
  // loadHighscore();
  $("#score-ctn").empty;
  // show only the showHighscoreWrapper section
  // startGameWrapper.style.display = 'none';
  // showHighscoreWrapper.style.display = 'inline';
  // endGameWrapper.style.display = 'none';
  // questionWrapper.style.display = 'none';

  // sort the highscoreArray in descending order based on the score
  highscoreArray = highscoreArray.sort(function(a, b){return b.score - a.score});

  // create list item for the highscoreArray
  var listContainerEl = document.createElement('ol');
  listContainerEl.id = 'highscoreListContainer';
  
  // for loop to create all the highscores from the highscoreArray into a list
  for (i = 0; i < highscoreArray.length; i++) {
      var listItemEl = document.createElement('li');
      listItemEl.innerHTML = highscoreArray[i].name + ": " + highscoreArray[i].score + "<br>";
      listContainerEl.appendChild(listItemEl);
  }
  console.log(highscoreArray);
  // add the list of highscores into the listContainerEl
  $("#score-ctn").prepend(listContainerEl);
}

var loadHighscore = function() {
  // set highscoreArray to empty
  highscoreArray = [];

  // retreve the highscores from localStorage
  var savedHighscore = localStorage.getItem("scores");

  // check if the savedHighscore is null is so return false to exit the function
  if (!savedHighscore) {
      return false;
  }

  // convert the tasks from a stringify format to array format
  savedHighscore = JSON.parse(savedHighscore);

  // push savedHighscore into the highscoreArray
  for (i = 0; i < savedHighscore.length; i++) {
      highscoreArray.push(savedHighscore[i]);
  }
}

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

// open start modal
$("#start-btn").on("click", function () {
  $("#start-modal").addClass("is-active is-clipped");
  generateCategory();
});

//close start modal
$("#start-modal .close").on("click", function () {
  $("#start-modal").removeClass("is-active is-clipped");
});

// close prompt modal
$("#prompt-modal .close").on("click", function () {
  $("#prompt-modal").removeClass("is-active is-clipped");
  promptContent.textContent = "";
});

// submit user selections in modal to the api call
$("#start-modal .is-success").on("click", function () {
  // get user inputs from the modal and store them to get put into the api call
  if (!$("#playerName").val()) {
    $("#prompt-modal").addClass("is-active is-clipped");
    promptContent.textContent = "Please enter a Player Name!";
  } 
  else {
    playerName = $("#playerName").val();

    if ($("#difficultySelect").val() != "Any Difficulty") {
      difficulty = "&difficulty=" + $("#difficultySelect").val().toLowerCase();
    }

    if ($("#typeSelect").val() != "Any Type") {
      if ($("#typeSelect").val() === "Multiple Choice") {
        type = "&type=multiple";
      } else {
        type = "&type=boolean";
      }
    }

    if ($("#categorySelect").val() != "Any Category") {
      category =
        "&category=" + $("#categorySelect").find("option:selected").attr("id");
    }

    // hide the modal so we can take the quiz
    $("#start-modal").removeClass("is-active is-clipped");
    // run function to start the quiz with the stored user inputs
    startGame();
  }
});

$(window).on('resize', function() {
  if($(window).width() <= 575 ) {
    $('#start-btn, #high-btn').removeClass('is-normal');
    $('#start-btn, #high-btn').removeClass('is-medium');
    $('#start-btn, #high-btn').removeClass('is-large');
    $('#start-btn, #high-btn').addClass('is-small');
  }
  else if($(window).width() > 575 && $(window).width() <= 768) {
    $('#start-btn, #high-btn').removeClass('is-small');
    $('#start-btn, #high-btn').removeClass('is-medium');
    $('#start-btn, #high-btn').removeClass('is-large');
    $('#start-btn, #high-btn').addClass('is-normal');
  }
  else if($(window).width() > 768 && $(window).width() <= 980) {
    $('#start-btn, #high-btn').removeClass('is-small');
    $('#start-btn, #high-btn').removeClass('is-normal');
    $('#start-btn, #high-btn').removeClass('is-large');
    $('#start-btn, #high-btn').addClass('is-medium');
  }
  else {
    $('#start-btn, #high-btn').removeClass('is-small');
    $('#start-btn, #high-btn').removeClass('is-medium');
    $('#start-btn, #high-btn').removeClass('is-normal');
    $('#start-btn, #high-btn').removeClass('is-normal');
    $('#start-btn, #high-btn').addClass('is-large');
  }
})