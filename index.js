const util = require('util')
var request = require('request');
var async = require('async');
var Q = require('q');
var cheerio = require('cheerio');
var express = require('express');
var sentiment = require('sentiment');
var googleTrends = require('google-trends-api');
var googleFinance = require('google-finance');

var app = express();

app.get('/', function (req, res) {
	res.send('Hello World!')
})

var server = app.listen(3000, 'localhost', function () {
	var host = server.address().address
	var port = server.address().port
	console.log('Listening at http://%s:%s', host, port)
  // googleFinance.companyNews({
  //   symbol: 'NASDAQ:AAPL'
  // }, function (err, news) {
  //   //...
  //   console.log(news);
  // });
  // getSubReddit('litecoin').then(function(urls) {});
  // getGoogleTrendsKeywords().then(function(keywords) {
  //   console.log(keywords);
  // });
  // var text = "The movie attempts to be surreal by incorporating various time paradoxes,"+
  //               "but it's presented in such a ridiculous way it's seriously boring.";
  // var r1 = sentiment(text);
  // console.log(r1);
  // googleTrends.interestOverTime({keyword: 'bitcoin', startTime: new Date('2017-01-01'), endTime: new Date(Date.now())})
  // .then(function(results){
  //   var timelineData = JSON.parse(results).default.timelineData;
  //   console.log(timelineData);
  // })
  // .catch(function(err){
  //   console.error('Oh no there was an error', err);
  // });


	// googleTrends.relatedTopics({keyword: 'bitcoin', startTime: new Date('2017-01-01'), endTime: new Date(Date.now())})
	// .then((results) => {
	// 	var relatedKeyWords = [];
	//  var relatedTopics = JSON.parse(results).default.rankedList;
	//  for (var i = 0; i < relatedTopics.length; i++) {
	// 	 for (var j = 0; j < relatedTopics[i].rankedKeyword.length; j++) {
	// 		 console.log(util.inspect(relatedTopics[i]['rankedKeyword'][j]['topic']['title'], false, null));
	// 	 }
	//  };
	// })
	// .catch((err) => {
	//   console.log(err);
	// })
});

var getSubReddit = function(searchQuery) {
  var deferred = Q.defer();
  var url = 'https://www.reddit.com/r/' + searchQuery;
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(body);
      var urls = [];
    $('a.title').each(function() {
      console.log($(this).first().text())
      // urls.push($(this).children().first().attr('href'));
    });
    deferred.resolve(urls);
    }
  });
  return deferred.promise;
}

var getGoogleTrendsKeywords = function() {
  var deferred = Q.defer();
  var url = 'https://trends.google.com/trends/hottrends/atom/hourly';
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(body);
      var keywords = [];
      $('a').each(function(index) {
        var keyword = {
            rank: index + 1,
            title: $(this).first().text(),
            sentiment: sentiment($(this).first().text())
        }
        keywords.push(keyword);
      });
    deferred.resolve(keywords);
    }
  });
  return deferred.promise;
}

var getFinalStocks = function(multiSymbolsArray){
  var stockPromises = [];
  for (var i = 0; i < multiSymbolsArray.length; i++) {
    stockPromises.push(googleYahooRequests(multiSymbolsArray[i]));
  }
  return Q.all(stockPromises);
}
