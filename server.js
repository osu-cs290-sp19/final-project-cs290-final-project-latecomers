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

/*
var hostName = 'classmongo.engr.oregonstate.edu';
MongoDB hostname: classmongo.engr.oregonstate.edu
Database name: cs290_YOUR_ONID_ID(e.g.cs290_hessro)
Username: cs290_YOUR_ONID_ID(e.g.cs290_hessro)
Password: cs290_YOUR_ONID_ID(e.g.cs290_hessro)
*/


/*
var url = 'mongodb://cs290_bochslev:cs290_bochslev@classmongo.engr.oregonstate.edu:27017/cs290_bochslev'
var mongoDataBase;
// Connect using MongoClient
mongoClient.connect(url, function (err, client)
{
    if (err) {
        throw err;
    }
    mongoDataBase = client.db('cs290_bochslev');
    app.listen(3000, function () {
        console.log("== Server listening on port 3000");
    });
});

*/

app.use(express.static('public'));


// there should be a way with express to get a client list?
var clients = [];

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
      
    res.status(200).render('homePageView', {
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
function heartBeatPacketParser(packetData)
{
    count++;
    console.log('heartbeeet');
    return true;
}


// parse the packet for anything to do with story communications
// I should be ashamed, this function should be shared between client and server but ive only found odd or hacky ways to have structs and share js files between server/client or even between different client js files...
function storyPacketParser(storyObject)
{
    count++;
    console.log(storyObject.storyOperation);

    if (_verifyStoryPacket(storyObject)) {
        // we know the packet is valid so we can freely utilize the data fields without fear for most things, if the user is appending to a 'finished' story chain, that will be filtered below
        // because accessing the db and checking if the story chain is over for every packet is expensive, and with a proper client.js this issue should only arise when bug hunters are afoot.

        // add an Id to the story object, add it to the database, and (session id's:? (know how long ago each user received updated DB information)) push the new story to the 'recent stories' view
        // upon processing an upvote it will reorder the stories based on popularity and give this information to clients.

        switch (storyObject.storyOperation)
        {
            case 'create':
                _insertStoryObjectMongo(storyObject);
                break;
            case 'end':
                _appendStoryObjectMongo(storyObject); // append like some null object, or special values object to indicate a story chain has been ended.
                break;
            case 'append':
                // make sure the story chain is not finished before appending
                _appendStoryObjectMongo(storyObject); // regular append 
                break;
            // who owns each story? I guess the server does now
            case 'delete':
                // every so often dump the oldest, least active stories?
                _deleteStoryObjectMongo(storyObject);
                break;
                // no default, it cannot exist after the packet has been verified
        }
    }
    else
        console.log("parse fail");


    return true;
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
//

function _insertStoryObjectMongo(storyObject)
{

}


function _appendStoryObjectMongo(storyObject)
{
    // if the last object has storyEnd: true
}

function _deleteStoryObjectMongo(storyObjectId)
{

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
            if (!storyObject.storyText || !storyObject.storyAuthor)
                return false;
            break;
        case 'end':
            if (!storyObject.storyId)
                return false;
            break;
        case 'append':                                              // the client will receive current trending stories, etc etc and will need to bundle the Id to request an append
            if (!storyObject.storyText || !storyObject.storyAuthor || !storyObject.storyId)
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
         storyPacket: { 'function': storyPacketParser } 
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
        return;
    }


    // call the appropriate parser depending on the packet type.
    console.log('$%#^$%^*^&@$#%^&*)&*()^&*($%#^&@$%^$%&:    ', count);


    // 
    res.status(200).send( (packetTypes[tempField].function(req.body.packetData)) ? "success" : "error");

});

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


app.get('*', function (req, res)
{
    res.status(404).render('404View');
});

app.listen(3000, function () {
    console.log("== Server listening on port 3000");
});