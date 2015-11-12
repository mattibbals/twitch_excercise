var searchQuery = document.getElementById("search_query");
var searchSubmit = document.getElementById("search_submit");
var searchResults = document.getElementById("search_results");
var prevPage = document.getElementById("prev_page");
var nextPage = document.getElementById("next_page");
var totalResults = document.getElementById("total_results");
var currentPage = document.getElementById("current_page");
var currentPageLink = false;
var nextPageLink = false;
var prevPageLink = false;
var selfPageLink = false;
var totalStreamOffset = 0;
var currentStreamOffset = 0;
var totalResults = 0;

searchSubmit.addEventListener("click", function(){
	if (passesValidation(searchQuery.value)) {
    	fetchData("https://api.twitch.tv/kraken/search/streams?q=" + searchQuery.value);
    }
});
nextPage.addEventListener("click", function(){
	if (nextPageLink !== false) {
		fetchData(nextPageLink);
		totalStreamOffset = ((totalStreamOffset + currentStreamOffset) > totalResults) ? (totalResults - currentStreamOffset) : (totalStreamOffset + currentStreamOffset);

	}
});
prevPage.addEventListener("click", function(){
	if (prevPageLink !== false) {
		fetchData(prevPageLink);
		totalStreamOffset = (totalStreamOffset - currentStreamOffset < 0) ? 0 : (totalStreamOffset - currentStreamOffset);
	}
});
currentPage.addEventListener("click", function(){
	if (currentPageLink !== false) {
		fetchData(currentPageLink);
	}
});
function passesValidation(inSearchQuery) {
	return true;
}
function getStreamInfoHTML(inStreamInfo) {
	var retHTML = "";
	for (var key in inStreamInfo) {
		if (inStreamInfo.hasOwnProperty(key)) {
			if (typeof(inStreamInfo[key]) == 'object') {
				retHTML += "<div>" + key + " = <div class='stream-padding'>" + getStreamInfoHTML(inStreamInfo[key]) + "</div></div>";
			} else {
			    retHTML += "<div>" + key + " = " + inStreamInfo[key] + '</div>';				
			}
		}
	}
	return retHTML;
}
function listStreams(inStreamArr) {
	for (var i = 0; i < inStreamArr.length; i++) {
		document.getElementById("stream_result_" + i).style.display = "list-item";
		document.getElementById("stream_display_name_" + i).innerText = inStreamArr[i].channel.display_name;
		document.getElementById("stream_game_name_" + i).innerText = inStreamArr[i].channel.game;
		document.getElementById("stream_number_viewers_" + i).innerText = inStreamArr[i].viewers;
		document.getElementById("stream_image_" + i).src = inStreamArr[i].channel.logo;
		document.getElementById("stream_info_" + i).innerHTML = getStreamInfoHTML(inStreamArr[i]);
	}
	for (i = i; i < 9; i++) {  /*must match the max in the HTML file*/
		document.getElementById("stream_result_" + i).style.display = "none";
	}
}
function setHeaderInfo(inLinks, inTotal, inNumStreams) {
	nextPageLink = false;
	nextPage.style.display = "none";
	prevPageLink = false;
	prevPage.style.display = "none";
	currentPageLink = false;
	currentPage.style.display = "none";
	totalResults = inTotal;
	if (inLinks.next) {
		nextPageLink = inLinks.next;
		nextPage.style.display = "inline";
	}
	if (inLinks.prev) {
		prevPageLink = inLinks.prev;
		prevPage.style.display = "inline";
	} else {
		totalStreamOffset = 0;
		currentStreamOffset = 0;		
	}
	if (inLinks.self) {
		currentPageLink = inLinks.self;
		currentPage.style.display = "inline";
		console.log("num streams", inNumStreams);
		console.log("totalStreamOffset", totalStreamOffset);
		console.log("currentStreamOffset", currentStreamOffset);
		if (inNumStreams != 0) {
			currentPage.innerText = "showing " + (totalStreamOffset + 1) + " - " + (totalStreamOffset + inNumStreams) + " of " + inTotal;
		} else {
			currentPage.innerText = "showing " + 0 + " of " + inTotal;
			nextPage.style.display = "none";
			totalStreamOffset = totalResults;

		}
		
	//	currentPage.innerText = currentPageNum + " / " + Math.floor(inTotal / inNumStreams);
		currentStreamOffset = inNumStreams;
	}

	totalResults.innerHTML = inTotal;
}

function fetchData(inSearchUrl) {
	var $jsonp = (function(){
	  var that = {};

	  that.send = function(src, options) {
	    var callback_name = options.callbackName || 'callback',
	      on_success = options.onSuccess || function(){},
	      on_timeout = options.onTimeout || function(){},
	      timeout = options.timeout || 10; // sec

	    var timeout_trigger = window.setTimeout(function(){
	      window[callback_name] = function(){};
	      on_timeout();
	    }, timeout * 1000);

	    window[callback_name] = function(data){
	      window.clearTimeout(timeout_trigger);
	      on_success(data);
	    }

	    var script = document.createElement('script');
	    script.type = 'text/javascript';
	    script.async = true;
	    script.src = src;

	    document.getElementsByTagName('head')[0].appendChild(script);
	  }

	  return that;
	})();
	
	$jsonp.send(inSearchUrl + '&callback=streamSearch', {
	    callbackName: 'streamSearch',
	    onSuccess: function(json){
	    	var html = "";
	    	setHeaderInfo(json._links, json._total, json.streams.length);
	    	listStreams(json.streams);
	        console.log('success!', json);
	    },
	    onTimeout: function(){
	        console.log('timeout!');
	    },
	    timeout: 5
	});
}

