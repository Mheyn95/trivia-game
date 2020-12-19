$('#modal-button').on('click', function() {
    $('#start-modal').addClass('is-active is-clipped');
    generateCategory();
});

$('#start-modal .close').on('click', function() {
    $('#start-modal').removeClass('is-active is-clipped');
});

var generateCategory = function() {
    var categoryUrl = 'https://opentdb.com/api_category.php'

    fetch(categoryUrl)
        .then(function(categoryResponse) {
            if (categoryResponse.ok) {
                return categoryResponse.json();
            }
            else {
                alert('Error: ' + categoryResponse.statusText);
            }
        })
        .then(function(categoryResponse) {
            var categorySeclectEl = document.getElementById('categorySelect');
            for(var i = 0; i < categoryResponse.trivia_categories.length; i++) {
                var optionEl = document.createElement('option');
                optionEl.innerHTML = categoryResponse.trivia_categories[i].name;
                optionEl.setAttribute('id', categoryResponse.trivia_categories[i].id);
                categorySeclectEl.appendChild(optionEl);
            }
        })
        .catch(function (error) {
            alert('Unable to connect to Trivia API');
        })
};