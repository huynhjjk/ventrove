var request = require('request');
var Q = require('q');
var cheerio = require('cheerio');
var express = require('express');


var app = express();

app.get('/', function (req, res) {
	res.send('Hello World!')
})

var server = app.listen(3000, 'localhost', function () {
	var host = server.address().address
	var port = server.address().port
	console.log('Listening at http://%s:%s', host, port)
  // getSubReddit('litecoin').then(function(urls) {});
  getGoogleTrends().then(function(urls) {});
});

var getSubReddit = function(searchQuery) {
  var deferred = Q.defer();
  var url = 'https://www.reddit.com/r/' + searchQuery;
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(body);
      var urls = [];
    $('a.title').each(function() {
      console.log($(this).first().text());
      // urls.push($(this).children().first().attr('href'));
    });
    deferred.resolve(urls);
    }
  });
  return deferred.promise;
}

var getGoogleTrends = function() {
  var deferred = Q.defer();
  var url = 'https://trends.google.com/trends/hottrends/atom/hourly';
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(body);
      var urls = [];
      $('a').each(function() {
        console.log($(this).first().text());
        // urls.push($(this).children().first().attr('href'));
      });
    deferred.resolve(urls);
    }
  });
  return deferred.promise;
}
