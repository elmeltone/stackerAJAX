// this function takes the question object returned by the StackOverflow request
// and returns new result to be appended to DOM
var showQuestion = function(question) {
	
	// clone our result template code
	var result = $('.templates .question').clone();
	
	// Set the question properties in result
	var questionElem = result.find('.question-text a');
	questionElem.attr('href', question.link);
	questionElem.text(question.title);

	// set the date asked property in result
	var asked = result.find('.asked-date');
	var date = new Date(1000*question.creation_date);
	asked.text('Asked: ' + date.toString());

	// set the .viewed for question property in result
	var viewed = result.find('.viewed');
	viewed.text('Views: ' + question.view_count);

	// set some properties related to asker
	var asker = result.find('.asker');
	asker.html('<p>Asker:<br><a target="_blank" '+
		'href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
		question.owner.display_name +
		'</a><br>Reputation: ' + question.owner.reputation + '</p>'
	);

	return result;
};

var showAnswerer = function(answer) {
	
	// clone result template code
	var result = $('.templates .answer').clone();
	
	// Set the answerer properties in result
	var answerElemLink = result.find('.profile_image a');
	answerElemLink.attr('href', answer.user.link);
	var answerElemPic = result.find('.profile_image img');
	answerElemPic.attr("src", answer.user.profile_image);

	// set the name property in result
	var displayName = result.find('.display_name a');
	displayName.attr('href', answer.user.link);
	displayName.text(answer.user.display_name);

	// set the reputation property in result
	var reputation = result.find('.reputation');
	reputation.text('Reputation: ' + answer.user.reputation);

	// set the accept rate property in result
	var acceptRate = result.find('.accept_rate');
	acceptRate.text('Accept Rate: ' + answer.user.accept_rate);

	return result;
};

// this function takes the results object from StackOverflow
// and returns the number of results and tags to be appended to DOM
var showSearchResults = function(query, resultNum) {
	var results = '<strong>' + resultNum + ' results...</strong>';
	return results;
};

// takes error string and turns it into displayable DOM element
var showError = function(error){
	var errorElem = $('.templates .error').clone();
	var errorText = '<p>' + error + '</p>';
	errorElem.append(errorText);
};

// takes a string of semi-colon separated tags to be searched
// for on StackOverflow

var getUnanswered = function(tags) {
	
	// the parameters we need to pass in our request to StackOverflow's API
	var request = { 
		tagged: tags,
		site: 'stackoverflow',
		order: 'desc',
		sort: 'creation'
	};
	
	$.ajax({
		url: "http://api.stackexchange.com/2.2/questions/unanswered",
		data: request,
		dataType: "jsonp",//use jsonp to avoid cross origin issues
		type: "GET",
	})
	.done(function(result){ //this waits for the ajax to return with a succesful promise object
		
		var searchResults = showSearchResults(request.tagged, result.items.length);
	
		$('.search-results').html(searchResults);
		//$.each is a higher order function. It takes an array and a function as an argument.
		//The function is executed once for each item in the array.
		$.each(result.items, function(i, item) {
			var question = showQuestion(item);
			$('.results').append(question);
		});
	})
	.fail(function(jqXHR, error){ //this waits for the ajax to return with an error promise object
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
};

var getAnswerers = function(tags) {
	
	// the parameters we need to pass in our request to StackOverflow's API
	var request = { 
		tagged: tags,
		site: 'stackoverflow',
		order: 'desc',
		sort: 'reputation',
	};
	
	$.ajax({
		url: "http://api.stackexchange.com/2.2/tags/" + request.tagged + "/top-answerers/all_time",
		data: request,
		dataType: "jsonp",//use jsonp to avoid cross origin issues
		type: "GET",
	})
	.done(function(result){ //this waits for the ajax to return with a succesful promise object
		
		var searchResults = showSearchResults(request.tagged, result.items.length);
	
		$('.search-results').html(searchResults);
		//$.each is a higher order function. It takes an array and a function as an argument.
		//The function is executed once for each item in the array.
		$.each(result.items, function(i, item) {
			var answerer = showAnswerer(item);
			$('.results').append(answerer);
		});
	})
	.fail(function(jqXHR, error){ //this waits for the ajax to return with an error promise object
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
};

$(document).ready( function() {
	$('.unanswered-getter').submit( function(e){
		e.preventDefault();
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
		var tags = $(this).find("input[name='tags']").val();
		getUnanswered(tags);
	});
	
	$('.inspiration-getter').submit( function(e){
		e.preventDefault();
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
		var tags = $(this).find("input[name='tags']").val();
		getAnswerers(tags);
	});
});
