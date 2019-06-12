var path = require('path');
var express = require('express');
var exphbs = require('express-handlebars');

var app = express();
var port = process.env.PORT || 3000;

var storyData = require('./storyData');
console.log("== storyData", storyData);

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(express.static('public'));

app.get('/', function (req, res) {
	res.status(200).render('storyPage', {storyData});
});

app.get('*', function (req, res) {
  res.status(404).render('404Page');
});

app.listen(port, function () {
  console.log("== Server is listening on port", port);
});
