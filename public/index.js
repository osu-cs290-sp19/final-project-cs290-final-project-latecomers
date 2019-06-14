

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
    var theObject = _constructStoryObject(0, storyId, 'upvote', 0, 0, 0, 0, 0, 0);

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
 * Wait until the DOM content is loaded, and then hook up UI interactions, etc.
 */
window.addEventListener('DOMContentLoaded', function () {

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


  var theStory = document.getElementsByClassName('theStory');
  console.log('thestory: ',theStory);
  
  if (theStory) {
      for (let i = 0; i < theStory.length; i++)
      {
          var upvote = theStory[i].getElementsByClassName('fas fa-thumbs-up');
          var tempId = theStory[i].getElementsByClassName("hidden-id");

          //console.log('theupvote: ', upvote);
          //console.log('thetempid: ', tempId[0].textContent);

	      upvote[0].addEventListener('click', function (event)
	      {
	          console.log(event);
	          event.target.style.color = "blue";
              
	          console.log('parent: ', event.target.parentNode.parentNode);

	          var tempTemp = event.target.parentNode.parentNode.getElementsByClassName("hidden-id");
	          
	          upVoteStory(parseInt(tempTemp[0].textContent, 10));
	          //upVoteStory();
	         });
	  } // end for
  }
});
