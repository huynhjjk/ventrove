const util = require('util')
const request = require('request');
const async = require('async');
const Q = require('q');
const cheerio = require('cheerio');
const express = require('express');
const sentiment = require('sentiment');
const googleTrends = require('google-trends-api');
const googleFinance = require('google-finance');
const chalk = require('chalk');

const app = express();

app.get('/', function (req, res) {
  res.send('Hello World!')
})

const server = app.listen(3000, 'localhost', function () {
	const host = server.address().address
	const port = server.address().port
  console.log('Listening at http://%s:%s', host, port)
  console.log(chalk.blue('Hello world!'));
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
  // const text = "The movie attempts to be surreal by incorporating constious time paradoxes,"+
  //               "but it's presented in such a ridiculous way it's seriously boring.";
  // const r1 = sentiment(text);
  // console.log(r1);
  // googleTrends.interestOverTime({keyword: 'bitcoin', startTime: new Date('2017-01-01'), endTime: new Date(Date.now())})
  // .then(function(results){
  //   const timelineData = JSON.parse(results).default.timelineData;
  //   console.log(timelineData);
  // })
  // .catch(function(err){
  //   console.error('Oh no there was an error', err);
  // });


	// googleTrends.relatedTopics({keyword: 'bitcoin', startTime: new Date('2017-01-01'), endTime: new Date(Date.now())})
	// .then((results) => {
	// 	const relatedKeyWords = [];
	//  const relatedTopics = JSON.parse(results).default.rankedList;
	//  for (const i = 0; i < relatedTopics.length; i++) {
	// 	 for (const j = 0; j < relatedTopics[i].rankedKeyword.length; j++) {
	// 		 console.log(util.inspect(relatedTopics[i]['rankedKeyword'][j]['topic']['title'], false, null));
	// 	 }
	//  };
	// })
	// .catch((err) => {
	//   console.log(err);
	// })
});

const getSubReddit = function(searchQuery) {
  const deferred = Q.defer();
  const url = 'https://www.reddit.com/r/' + searchQuery;
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(body);
      const urls = [];
    $('a.title').each(function() {
      console.log($(this).first().text())
      // urls.push($(this).children().first().attr('href'));
    });
    deferred.resolve(urls);
    }
  });
  return deferred.promise;
}

const getGoogleTrendsKeywords = function() {
  const deferred = Q.defer();
  const url = 'https://trends.google.com/trends/hottrends/atom/hourly';
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(body);
      const keywords = [];
      $('a').each(function(index) {
        const keyword = {
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

const getFinalStocks = function(multiSymbolsArray){
  const stockPromises = [];
  for (const i = 0; i < multiSymbolsArray.length; i++) {
    stockPromises.push(googleYahooRequests(multiSymbolsArray[i]));
  }
  return Q.all(stockPromises);
}
