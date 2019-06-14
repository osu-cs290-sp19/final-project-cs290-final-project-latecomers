

function infiniteLoop()
{
    x = 3;  // every 3 seconds

    var currentTimeStamp = Date.now();

    var heartBeatObject = _constructHeartBeatObject(currentTimeStamp);

    var heartBeatPacket = _constructHeartBeatPacket(heartBeatObject);

    _postJsonToPath(heartBeatPacket, '/DataUpload', function (event)
    {
        // The response is http, which here is built on tcp; so no parsing/verification is required unless someone broke tcp sequence numbering or something else fundamental to inject malicous data in,
        // we assume to trust the server becaue the server could drop an exploit in a myriad of other vectors besides my packet parsing implementation. (the server however, does parse client packets)
        if (event.target.status !== 200) {
            console.log(event.target.response);
            // error handling
        }
        else {
            /* server responded with success and will post a delta of storyObject changes...
                the first heartBeat the client sends will be met with all stories on the home page,
                and every subsequent heartBeat thereafter; the server will respond with deltas, or
                the changes (creates, deletes, appends, upvotes) that the server has witnessed
                between successive heartbeats. The client is basically polling the server every X seconds
                for changes as the story system evolution progresses.
            */

            // for now send ANY object to the client that has deltad in this timeStamp timeframe.
            
        }
    });

    setTimeout(infiniteLoop, x * 1000);
}
infiniteLoop();


// all stories are public, there are no security concerns with users war dialing id's
/*
    example request

    mutually exclusive: choose either topTen, storyId, or filters.
    {
        topTen: true,
        storyIds: [4,5,2],
        filters: [
            storyText: 'string',
            storyAuthor: 'string',
            upVotes: {min: 12, max: 14}

        ]

    }
*/

// request data from the server
function requestData(requestType, requestData)
{
    var theObject = _constructRequestObject(requestType, requestData);

    var thePacket = _constructRequestPacket(theObject);

    _postJsonToPath(thePacket, '/DataUpload', function (event) {
        if (event.target.status !== 200) {
            console.log(event.target.response);
            // error handling
        }
        else {
            // ok
            console.log(event.target.response);
            
        }
    });
}

function upVoteStory(storyId)
{
    var theObject = _constructStoryObject(0, storyId, 'upVote', 0, 0, 0, 0, 0, 0);

    var thePacket = _constructStoryPacket(theObject);

    _postJsonToPath(thePacket, '/DataUpload', function (event) {
        if (event.target.status !== 200) {
            console.log(event.target.response);
            // error handling
        }
        else {
            ;
            console.log(event.target.response);
            // do something
        }
    });
}

function appendStory(storyId, storyText, storyAuthor, storyTitle)
{
    var theObject = _constructStoryObject(storyTitle, storyId, 'append',0, 0, storyText, storyAuthor, 0, 0);
 

    var thePacket = _constructStoryPacket(theObject);

    _postJsonToPath(thePacket, '/DataUpload', function (event) {
        if (event.target.status !== 200) {
            console.log(event.target.response);
            // error handling
        }
        else {
            ;
            console.log(event.target.response);
            // do something
        }
    });

}

// 
function createStory(storyText, storyAuthor, storyTitle)
{
   
    //var currentTimeStamp = Date.now();

    // damn javascript where are my structs IN SEPARATE FILES, oh well a project this small just make sure the values match on client/server
    var theObject = _constructStoryObject(storyTitle,0,'create',0,0,storyText, storyAuthor, 0, 0);
    
    var thePacket = _constructStoryPacket(theObject);

    _postJsonToPath(thePacket, '/DataUpload', function (event)
    {
        if (event.target.status !== 200) {
            console.log(event.target.response);
            // error handling
        }
        else {
            // server responded with success we are in the clear for dom insertion, we dont want stale dom nodes that dont exist on the server
            console.log(event.target.response);
			window.alert('Story was uploaded');
        }
    });

    
}

// all stories are public, there are no security concerns with users war dialing id's
/*
    example request

    mutually exclusive: choose either topTen, storyId, or filters.
    {
        topTen: true,
        storyIds: [4,5,2],
        filters: [
            storyText: 'string',
            storyAuthor: 'string',
            upVotes: {min: 12, max: 14}

        ]

    }
*/
function _constructRequestObject(requestType, requestData)
{

    //var requestObject;
    switch (requestType)
    {
        case topTen:
            var requestObject = {
                topTen: true
            }
            return requestObject;
            break;
        case storyIds:
            var requestObject = {
                storyIds: requestData
            }
            return requestObject;
            break;
        case filters:
            var requestObject = {
                filters: requestData
            }
            return requestObject;
            break;

        default:
            break;
    }

}

// the struct of the storyObject, all code that handles any storyObject should adhere to the structure of the object defined here
function _constructStoryObject(storyTitle, storyId, storyOperation, storyUpvotes, storyDate, storyText, storyAuthor, storyImage, storyEnd)
{
    var storyObject = {
        storyTitle: storyTitle,
        storyId: storyId,// set by the server to manage all the stories
        storyOperation: storyOperation, // useless outside the context of performing an action on an object
        storyUpvotes: storyUpvotes,
        storyDate: storyDate,
        storyText: storyText,
        storyAuthor: storyAuthor,
        storyImage: storyImage, // 'image5.png'
        storyEnd: storyEnd
    };

    return storyObject;
}

// the struct of the heartBeatObject, all code that handles any heartBeatObject should adhere to the structure of the object defined here.
function _constructHeartBeatObject(timeStamp)
{
    var heartBeatObject = {
        timeStamp: timeStamp
    };

    return heartBeatObject;
}


function _constructRequestPacket(request)
{
    return _constructPacket('requestPacket', request);
}

function _constructStoryPacket(storyObjectData)
{
    return _constructPacket('storyPacket', storyObjectData);
}

function _constructHeartBeatPacket(heartBeatObjectData)
{
    return _constructPacket('heartBeat', heartBeatObjectData);
}

function _constructPacket(inputPacketType, inputPacketData)
{
    var thePacket =
        {
            packetType: inputPacketType,
            packetData: inputPacketData
        }

    return thePacket;
}


function _postJsonToPath(packet, postPath, successCallback)
{
    var request = new XMLHttpRequest();

    request.addEventListener('load', successCallback);

    request.open('POST', postPath);

    var requestBody = JSON.stringify(packet);

    request.setRequestHeader('Content-Type', 'application/json');

    request.send(requestBody);

}



/*
 * This is a global array containing an object representing each twit.  Each
 * twit object has the following form:
 *
 * {
 *   text: "...",
 *   author: "..."
 * }
 */
var allTwits = [];

/*
 * This function checks whether all of the required inputs were supplied by
 * the user and, if so, inserts a new twit into the page using these inputs.
 * If the user did not supply a required input, they instead receive an alert,
 * and no new twit is inserted.
 */
function handleModalAcceptClick() {

  var twitText = document.getElementById('twit-text-input').value;
  var twitAuthor = document.getElementById('twit-author-input').value;

  /*
   * Only generate the new twit if the user supplied values for both the twit
   * text and the twit attribution.  Give them an alert if they didn't.
   */
  if (twitText && twitAuthor)
  {

    allTwits.push({
      text: twitText,
      author: twitAuthor
    });

    //clearSearchAndReinsertTwits();

    
    createStory(twitText, twitAuthor);

    hideInsertDataInterface();

  } else {

    alert('You must specify both the text and the author of the twit!');

  }
}


/*
 * This function clears the current search term, causing all twits to be
 * re-inserted into the DOM.
 */
function clearSearchAndReinsertTwits() {

  document.getElementById('navbar-search-input').value = "";
  doSearchUpdate();

}


/*
 * This function shows the modal to create a twit when the "create twit"
 * button is clicked.
 */
function showInsertDataInterface() {

    var modalBackdrop = document.getElementById('modal-backdrop');
    var createTwitModal = document.getElementById('create-twit-modal');

  // Show the modal and its backdrop.
  modalBackdrop.classList.remove('hidden');
  createTwitModal.classList.remove('hidden');

}


/*
 * This function clears any value present in any of the twit input elements.
 */
function clearDataInputValues() {

  var twitInputElems = document.getElementsByClassName('data-input-element');
  for (var i = 0; i < twitInputElems.length; i++) {
    var input = twitInputElems[i].querySelector('input, textarea');
    input.value = '';
  }

}


/*
 * This function hides the modal to create a twit and clears any existing
 * values from the input fields whenever any of the modal close actions are
 * taken.
 */
function hideInsertDataInterface() {

  var modalBackdrop = document.getElementById('modal-backdrop');
  var createTwitModal = document.getElementById('create-twit-modal');

  // Hide the modal and its backdrop.
  modalBackdrop.classList.add('hidden');
  createTwitModal.classList.add('hidden');

  clearDataInputValues();

}


/*
 * A function that determines whether a given twit matches a search query.
 * Returns true if the twit matches the query and false otherwise.
 */
function twitMatchesSearchQuery(twit, searchQuery) {
  /*
   * An empty query matches all twits.
   */
  if (!searchQuery) {
    return true;
  }

  /*
   * The search query matches the twit if either the twit's text or the twit's
   * author contains the search query.
   */
  searchQuery = searchQuery.trim().toLowerCase();
  return (twit.author + " " + twit.text).toLowerCase().indexOf(searchQuery) >= 0;
}


/*
 * Perform a search over over all the twits based on the search query the user
 * entered in the navbar.  Only display twits that match the search query.
 * Display all twits if the search query is empty.
 */
function doSearchUpdate() {

  /*
   * Grab the search query from the navbar search box.
   */
  var searchQuery = document.getElementById('navbar-search-input').value;

  /*
   * Remove all twits from the DOM temporarily.
   */
  var twitContainer = document.querySelector('.story-container');
  if (twitContainer) {
    while (twitContainer.lastChild) {
      twitContainer.removeChild(twitContainer.lastChild);
    }
  }

  /*
   * Loop through the collection of all twits and add twits back into the DOM
   * if they match the current search query.
   */
  allTwits.forEach(function (twit) {
    if (twitMatchesSearchQuery(twit, searchQuery)) {
        ;//insertNewTwit(twit.text, twit.author); implement mongo search, or still client side (assuming server client in sync)
    }
  });

}


/*
 * This function parses an existing DOM element representing a single twit
 * into an object representing that twit and returns that object.  The object
 * is structured like this:
 *
 * {
 *   text: "...",
 *   author: "..."
 * }
 */
function parseTwitElem(twitElem) {

  var twit = {};

  var twitTextElem = twitElem.querySelector('.twit-text');
  twit.text = twitTextElem.textContent.trim();

  var twitAttributionLinkElem = twitElem.querySelector('.twit-author a');
  twit.author = twitAttributionLinkElem.textContent.trim();

  return twit;

}


/*
 * Wait until the DOM content is loaded, and then hook up UI interactions, etc.
 */
window.addEventListener('DOMContentLoaded', function () {

  var searchButton = document.getElementById('navbar-search-button');
  if (searchButton) {
    searchButton.addEventListener('click', doSearchUpdate);
  }

  var searchInput = document.getElementById('navbar-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', doSearchUpdate);
  }

  var story = document.getElementById('story-push');
  if (story) {
      story.addEventListener('click', function() {
	  var storyText = document.getElementById('text-input').value;
	  var storyTitle = document.getElementById('title-input').value;
	  var storyAuthor = document.getElementById('author-input').value;
	  if (storyText =="" || storyTitle =="" || storyAuthor =="" ||storyText.trim().length == 0 || storyTitle.trim().length == 0 || storyAuthor.trim().length == 0) {
		  window.alert("All fields must have text");
		  return;
	  }
	  else
		createStory(storyText, storyAuthor, storyTitle );
  });
  }


  var append = document.getElementById('story-append');
  if (append) {
      append.addEventListener('click', function () {
          var storyText = document.getElementById('text-input').value;
		  var storyTitle = document.getElementById('title-input').value;
          var storyAuthor = document.getElementById('author-input').value;
          if (storyText =="" || storyTitle =="" || storyAuthor =="" ||storyText.trim().length == 0 || storyTitle.trim().length == 0 || storyAuthor.trim().length == 0) {
              window.alert("All fields must have text");
              return;
          }
          else {
              //console.log(window.location.href);
              var splitItems = window.location.href.split('/');
              var id = parseInt(splitItems[splitItems.length - 1], 10);
              //window.location.href[window.location.href.length - 1];
              appendStory(id, storyText, storyAuthor, storyTitle);
			  window.alert('Story was updated. Refresh to see your changes');
          }
      });
  }


  var upvote = document.getElementsByClassName('fas fa-thumbs-up');
  if (upvote) {
	  for (let i = 0; i < upvote.length; i++) {  
		upvote[i].addEventListener('click', function() {
			upvote[i].style.color = "blue";
	  });
	  }
  }
});
