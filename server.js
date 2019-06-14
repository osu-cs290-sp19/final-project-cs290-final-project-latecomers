/*
 * Write your routing code in this file.  Make sure to add your name and
 * @oregonstate.edu email address below.
 *
 * Name: Vince Bochsler
 * Email: bochslev@oregonstate.edu
 */

var express = require('express');
var fs = require('fs');
var expressHandleBars = require('express-handlebars');

var app = express();
var port = process.env.PORT || 3000;


app.engine('handlebars', expressHandleBars({ defaultLayout: 'main' }));//
app.set('view engine', 'handlebars');



var formidable = require('formidable'),
    http = require('http'),
    util = require('util');



const serverUploadPath = 'E:/Final Project/uploads/';

// simple parsing, but all untrusted be careful.
var bodyParser = require('body-parser');
app.use(bodyParser.json());



const mongoClient = require('mongodb').MongoClient;
const test = require('assert');

// make our own events to create sync like behavior for database requests
var events = require('events');

/*
var hostName = 'classmongo.engr.oregonstate.edu';
MongoDB hostname: classmongo.engr.oregonstate.edu
Database name: cs290_YOUR_ONID_ID(e.g.cs290_hessro)
Username: cs290_YOUR_ONID_ID(e.g.cs290_hessro)
Password: cs290_YOUR_ONID_ID(e.g.cs290_hessro)
*/



var url = 'mongodb://cs290_bochslev:cs290_bochslev@classmongo.engr.oregonstate.edu:27017/cs290_bochslev';
var mongoDB;
var storiesCollection;
var globalStoryId = 1;
// Connect using MongoClient
mongoClient.connect(url, function (err, client)
{
    if (err) {
        throw err;
    }

    mongoDB = client.db('cs290_bochslev');
    app.listen(3000, function () {
        console.log("== Server listening on port 3000");
    });

    storiesCollection = mongoDB.collection('stories');
    
    storiesCollection.find().sort({storyId: -1}).limit(1).toArray(function (err, result) {
        if (err)
        {
            // error
            ;
        }
        
        if (result[0])
            globalStoryId = result[0].storyId + 1;
        
    });
    
});



app.use(express.static('public'));

/*
    the array of incoming story changes, so the server can push the changes to clients without having to send them everything

    each array element will be an object
    {
        storyId: storyId,
        storyOperation: storyOperation,
        timeStamp: timeStamp
    }
*/
var deltaArray = [];

// route chain below

// catch and filter every packet for adherence to basic structure.
app.post('*', function (req, res, next)
{
    // maybe a good place to add session id assignment to clients?
    // is this even a feature that needs to be implemented?
    //if (!req.body.) 
    next();
});


app.get('/', function (req, res)
{
      
    res.status(200).render('storyPage', {
     twits: 'nothing'
      });
   
});

app.get('/twits/:twitId', function (req, res, next) {
    var twitId = req.params.twitId;
    if (dataBase[twitId]) {
        res.render('twitView', {
            theTwit: dataBase[twitId]
        });
    } else {
        next();
    }
});

app.get('/upload', function (req, res, next) {
    res.status(200).render('upload');

});

/*
    The functions 
*/
count = 0;

// implement a temporary random user id?
function heartBeatPacketParser(heartBeatObject, response)
{
    count++;
    //console.log('heartbeeet');
    response.status(200).send((1) ? "success" : "error");
    return true;
}


// parse the packet for anything to do with story communications
// I should be ashamed, this function should be shared between client and server but ive only found odd or hacky ways to have structs and share js files between server/client or even between different client js files...

// increment each time. (when does this overflow?)
//storiesCollection.find.toArray({ $max: "storyId" });



function _appendCallbackHelper(err, result, storyObject, response)
{
    // if theres an error, no result, or the story has been ended return false.
    if (err || !result[0] || result[0].stories[result[0].stories.length - 1].storyEnd) {
        // error
        response.status(500).send('server error');
    }
    else {
        //console.log('rrrrrrrrr: ',response);
        //console.log(result[0].stories[0].storyAuthor);
        _appendStoryObjectMongo(storyObject, result[0]); // regular append
        response.status(200).send('success');
    }
    //response.status(200).send('success');
}

function storyPacketParser(storyObject, response)
{
    count++;
    console.log(storyObject.storyOperation);

    if (_verifyStoryPacket(storyObject)) {
        // we know the packet is valid so we can freely utilize the data fields without fear for most things, if the user is appending to a 'finished' story chain, that will be filtered below
        // because accessing the db and checking if the story chain is over for every packet is expensive, and with a proper client.js this issue should only arise when bug hunters are afoot.

        // add an Id to the story object, add it to the database, and (session id's:? (know how long ago each user received updated DB information)) push the new story to the 'recent stories' view
        // upon processing an upvote it will reorder the stories based on popularity and give this information to clients.

        switch (storyObject.storyOperation) {
            case 'create':
                storyObject.storyId = globalStoryId;
                globalStoryId++;

                storyObject.storyDate = Date.now();

                _insertStoryObjectMongo(storyObject);

                response.status(200).send('success');
                break;
            case 'end':
                // have to check if the user can end the story or if the story is already ended

                storiesCollection.find({ storyId: storyObject.storyId }).toArray(function (err, result) {
                    _appendCallbackHelper(err, result, storyObject, response);

                });

                
                break;
            case 'append':
                // have to check if the user can append or if the story is ended

                //storiesCollection.find({ storyId: storyObject.storyId }).toArray(function (err, result) {callback(err,result)});

                storiesCollection.find({ storyId: storyObject.storyId }).toArray(function (err, result) {
                    _appendCallbackHelper(err, result, storyObject, response);

                });
                
                
                break;
                // who owns each story? I guess the server does now
            case 'delete':
                // every so often dump the oldest, least active stories?
                _deleteStoryObjectMongo(storyObject);

                response.status(200).send('success');
                break;
                // no default, it cannot exist after the packet has been verified
        }

        
        return true;
    }
    else {
        response.status(400).send('Bad Request!');
        console.log("parse fail");
        return false;
    }
}


function _topTenRequestResponseHelper(err,result,response)
{
    if (err) {
        // error
        ;
    }

    console.log(result);
    response.status(200).send('success');
}

function _storyIdsRequestResponseHelper(err, result, response, numberOfElements)
{
    console.log(result);
    response.status(200).send('success');
}

function _filtersRequestResponseHelper(err, result, response)
{
    console.log(result);
    response.status(200).send('success');
}

function requestPacketParser(requestObject, response)
{
    if (_verifyRequestPacket(requestObject))
    {
        if (requestObject.topTen)
        {
            storiesCollection.find().sort({ storyUpvotes: -1 }).limit(10).toArray(function (err, result)
            {
                
                _topTenRequestResponseHelper(err,result,response);
            });
        }
        else if (requestObject.storyIds)
        {
            numberOfElements = requestObject.storyIds.length;
            // be safe and manually loop because we dont want foreach callback to break things because it can be finnicky when responding with status(x) to the client, or the client hangs.
            for (var i = 0; i < requestObject.storyIds.length; i++)
            {

                // there is only one id for each object, appended objects are child objects to the main parents object for any given ID
                storiesCollection.findOne({ storyId: requestObject.storyIds[i] }).toArray(function (err, result)
                {
                    _storyIdsRequestResponseHelper(err, result, response, numberOfElements);
                    numberOfElements--;

                });

            }
        }
        else if (requestObject.filters)
        {
            console.log(requestObject.filters);
        }
    }
    else
    {
        response.status(400).send('Bad Request!');
        console.log("parse fail");
        return false;
    }
}
/*  mongo document structure

    storyId: 4
    stories
    [
        storyObject1,
        storyObject2
    ]

    // stories[stories.length-1].
*/


function _insertStoryObjectMongo(storyObject)
{
    
    storiesCollection.insertOne({
        storyId: storyObject.storyId,
        stories: [storyObject]
    });
    console.log('inner insert', storyObject.storyId);
}


function _appendStoryObjectMongo(storyObject, parentObject)
{
    
    storiesCollection.updateOne(
        { storyId: parentObject.storyId },
        { $push: { stories: storyObject } });
    console.log('inner append', storyObject);
}

function _deleteStoryObjectMongo(storyObjectId)
{

}

function _pullDataMongo(requestType, requestObject)
{
    switch (requestType)
    {
        case topTen:
            storiesCollection.find
            break;
        case storyIds:

            break;
        case filters:

            break;

    }
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
function _verifyRequestPacket(requestObject)
{
    if (!requestObject)
        return false;

    if (requestObject.topTen)
    {
        return true;
    }
    else if (requestObject.storyIds)
    {
        // dont care if they aren't real id's, if the client makes a request and server finds nothing then send 400 bad request.
        return true;
    }
    else if (requestObject.filters)
    {
        return true;
    }
    else
    {
        return false;
    }
}

// make sure the story packet the client sends actually makes sense, and they have the authorization to perform said action
function _verifyStoryPacket(storyObject)
{
    // better have a packet and operation
    if (!storyObject || !storyObject.storyOperation)
        return false;

    // now lets verify the operations
    switch (storyObject.storyOperation)
    {
        case 'create':
            if (!storyObject.storyText || !storyObject.storyAuthor || !storyObject.storyTitle)
                return false;
            break;
        case 'end':
            if (!storyObject.storyId || !storyObject.storyEnd)
                return false;
            break;
        case 'append':                                                                  // globalStoryId == 1 signals that we dont have any objects to append too!
            if (!storyObject.storyId || !storyObject.storyText || !storyObject.storyAuthor || globalStoryId == 1)
                return false;
            break;
            // who owns each story?
        case 'delete':
            if (!storyObject.storyId)
                return false;
            break;
        default:
            return false;
    }

    return true;
}

// this strcture defines the packet type names to be used elsewhere in the code, also attaches the server sides parsers for said packets
var packetTypes =
{
         heartBeat: { 'function': heartBeatPacketParser } ,
         storyPacket: { 'function': storyPacketParser },
         requestPacket: { 'function': requestPacketParser }
};


// the path for all client/server communications
app.post('/DataUpload', function (req, res)
{
    // ensure the packetType is there and makes sense.
    var tempField = req.body.packetType;
    if (!(req.body) || !(packetTypes[tempField]))
    {
        // error what are you doing client
        console.log('DataUpload error');
        console.log(packetTypes[req.body.packetType]);

        console.log(packetTypes['heartbeat']);
        res.status(400).send('Bad Request');
        return;
    }


    // call the appropriate parser depending on the packet type.
    //console.log('$%#^$%^*^&@$#%^&*)&*()^&*($%#^&@$%^$%&:    ', count);


   
    packetTypes[tempField].function(req.body.packetData, res);


    //var test = packetTypes[tempField].function(req.body.packetData, res);

    //console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA ', test);

    //res.status(200).send((packetTypes[tempField].function(req.body.packetData)) ? "success" : "error");

    // return with success and a 200 status, indicating everything is fine, 

});





/*

 //Step 1: declare promise
      
    var myPromise = () => {
        return new Promise((resolve, reject) => {


        
            storiesCollection.find({ storyId: 1 }).toArray(function(err, data) {
                 err 
                    ? reject(err) 
                    : resolve(data[0]);
             });
        });
    };

    //Step 2: async promise handler
    var callMyPromise = async () => {
          
        var result = await (myPromise());
        //anything here is executed after result is resolved
        //console.log('ghghghghghghghgh',result[0]);
        //if (result)
            //res.status(200).send('success');
        //else
            //res.status(500).send('server error');

        return result;
    };
 
    //Step 3: make the call
    callMyPromise().then(function(result) {
        res.status(200).send(result);
    });

*/



app.post('/fileupload', function (req, res, next) {
    res.status(200).render('homePageView', { twits: dataBase });
    // redirect to home, todo: remove /fileupload from url?
    var form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {

        console.log("file parsed: ", files.uploadedFile);

        var oldpath = files.uploadedFile.path;
        var newpath = serverUploadPath + files.uploadedFile.name;
        fs.copyFile(oldpath, newpath, function (err)
        {
            if (err)
                console.log('error uploading');
            else
                console.log('File uploaded and moved!');
            
        });

        // let client know their file has been parsed with a ping
    });
});

app.get('/start', function(req, res) 
{
	console.log(req);
	res.status(200).render('promptPage');
});
app.get('*', function (req, res)
{
    console.log(req);
    res.status(404).render('404Page');
});

/*
app.listen(3000, function () {
    console.log("== Server listening on port 3000");
});
*/