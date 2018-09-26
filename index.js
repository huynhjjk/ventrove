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
const colors = require('colors');
const _ = require('lodash');
const commander = require('commander');
const app = express();
const Firestore = require('@google-cloud/firestore');
const firestore = new Firestore({
  projectId: 'ventrips-214422',
  keyFilename: './../ventrips-214422-firebase-adminsdk-w9d9x-fa4567e61b.json',
});
const settings = { timestampsInSnapshots: true};
firestore.settings(settings);

app.get('/', function (req, res) {
  res.send('Hello World!')
})

const server = app.listen(3000, 'localhost', function () {
	const host = server.address().address
	const port = server.address().port
  console.log('Listening at http://%s:%s', host, port)

  var program = commander;
 
  program
    .version('0.1.0')
    .option('-a, --all', 'All')
    .option('-r, --subreddit', 'Trending SubReddits')
    .option('-g, --github', 'Trending GitHub Repos')
    .option('-y, --youtube', 'Trending Youtube Videos')
    .parse(process.argv);
   
  if (program.all) {
    console.log(colors.red('All'));
  };
  if (program.subreddit) {
    console.log(colors.red('Trending SubReddits'));
    getTrendingSubReddits().then(function(data) {
      console.log(data);
    });
  };
  if (program.github) {
    console.log(colors.red('Trending GitHub Repos'));
    getTrendingGitHubRepos().then(function(data) {
      postDocuments(data, 'items');
    }).catch(error => {
      console.error('Failed to get trending GitHub Repos');
      console.error(error);
    });
  };
  if (program.youtube) {
    console.log(colors.red('Trending YouTube Videos'));
    getTrendingYoutubeVideos().then(function(data) {
      console.log(data);
    });
  };

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

function postDocuments(data, collectionName) {
  var writeBatch = firestore.batch();
  _.forEach(data, item => {
    const documentRef = firestore.collection(collectionName).doc();
    writeBatch.create(documentRef, item);
  });
  writeBatch.commit().then(() => {
    console.log('Successfully executed batch.');
  }).catch(error => {
    console.error('Failed to execute batch.')
    console.log(error);
  });
}

const getTrendingSubReddits = function() {
  const deferred = Q.defer();
  const url = 'http://redditlist.com/all';
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(body);
      const trendingSubReddits = [];
      var growth24hrs = $('.span4.listing').last();
      growth24hrs.each(function(){
        $(this).find(".listing-item").each(function() {
          var selection = $(this).find('.subreddit-url a');
          var subReddit = selection.text().trim();
          var url = selection.attr('href');
          var growthStat24Hr = $(this).find('.growth-stat').text().trim();
          growthStat24Hr = growthStat24Hr.replace('%','');
          trendingSubReddits.push({subReddit, url, growthStat24Hr});
        });
      });
    deferred.resolve(trendingSubReddits);
    }
  });
  return deferred.promise;
}

const getTrendingGitHubRepos = function() {
  const deferred = Q.defer();
  const baseUrl = 'https://github.com';
  const url = baseUrl + '/trending';
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(body);
      const trendingGitHubRepos = [];
      $(".repo-list li").each(function() {
        const selection = $(this).find('h3 a');
        const name = selection.text().trim();
        const url = baseUrl + selection.attr('href');
        const description = $(this).find('.py-1').text().trim();
        trendingGitHubRepos.push({name, url, description})
      });
      deferred.resolve(trendingGitHubRepos);
    }
  });
  return deferred.promise;
}


const getTrendingYoutubeVideos = function() {
  const deferred = Q.defer();
  const url = 'https://www.youtube.com/feed/trending';
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(body);
      const trendingYouTubeVideos = [];
      $("a .video-title").each(function() {
        console.log($(this).text());
        // const selection = $(this).find('h3 a');
        // const name = selection.text().trim();
        // const url = baseUrl + selection.attr('href');
        // const description = $(this).find('.py-1').text().trim();
        // trendingYouTubeVideos.push({name, url, description})
      });
      deferred.resolve(trendingYouTubeVideos);
    }
  });
  return deferred.promise;
}

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
