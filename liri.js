var fs = require("fs");

var query = process.argv[2];
// console.log(query);

//switch case for query from node command-line
switch (query) {
	case "my-tweets":
		myTweets();
		break;
	case "spotify-this-song":
		var songName = process.argv.slice(3).join(" ");
		songName = songName.trim();
		if (songName==="")
			songName = "The Sign Ace of Base";
		// console.log("song name - " + songName);
		getSongDetails(songName);
		break;
	case "movie-this":
		var movieName = process.argv.slice(3).join(" ");
		movieName = movieName.trim();
		if(movieName==="")
			movieName = "Mr. Nobody";
		// console.log("movie name - " + movieName);
		getMovieDetails(movieName);
		break;
	case "do-what-it-says":
		doWhatItSays();
		break;
}

function myTweets() {
	var Twitter = require('twitter');
	//get twitter api keys
	var twitterAPIKeys = require("./keys.js");
	var twtrKeys = twitterAPIKeys.twitterKeys;
	// console.log("loaded twitter keys - " + twtrKeys["consumer_key"]);
	var client = new Twitter({
		  consumer_key: twtrKeys["consumer_key"],
		  consumer_secret: twtrKeys["consumer_secret"],
		  access_token_key: twtrKeys["access_token_key"],
		  access_token_secret: twtrKeys["access_token_secret"]
		});
	//api call
	client.get('statuses/user_timeline', function(error, tweets, response) {
		// console.log(response);
		// console.log(tweets);
		if (error) {
		    console.log("twitter api call error - " + error);
		} else {
			var tweetMsgs = "\nMY TWEETS:\n";
			for (var i = 0; i < tweets.length; i++) {
				tweetMsgs += "Tweet: " + tweets[i].text + "\nCreated_at: " + tweets[i].created_at + "\n\n";
			}
	  		console.log(tweetMsgs);
	  		//append to log file
			fs.appendFile("log.txt", tweetMsgs, function(err) {
				if (err) {
					console.log("twitter write log file error - " + err);
				}
			});
		}	  	
	});
}

function getSongDetails(songName) {
	var Spotify = require('node-spotify-api');
	//get api keys
	var spotifyAPIKeys = require("./keys.js");
	var spotKeys = spotifyAPIKeys.spotifyKeys;
	// console.log("loaded spotify keys - " + spotKeys["client_id"]);
	var spotify = new Spotify({
		id: spotKeys["client_id"],
		secret: spotKeys["client_secret"]
	});
	//api call
	spotify.search({ type: 'track', query: songName }, function(err, data) {
		if (err) {
			console.log('spotify api call error - ' + err);
		} else {
			// var details = data.tracks.items[0];
			// console.log(details);
			var songDetails = "";
			var artists = data.tracks.items[0].artists;
			var artistNames = "";
			if (artists.length>1) {
				for (var i = 0; i < artists.length; i++) {
					artistNames += artists[i].name + ", ";
				}
			} else
				artistNames = artists[0].name;
			var albumName = data.tracks.items[0].album.name;
			var externalLink = data.tracks.items[0].external_urls.spotify;
			songDetails = "\nSONG DETAILS:\nArtist(s) - " + artistNames + "\n" + 
				"Song name - " + songName + "\n" + 
				"Spotify link - " + externalLink + "\n" + 
				"Album name - " + albumName + "\n-------------------------------------\n";
			console.log(songDetails);
			//append to log file
			fs.appendFile("log.txt", songDetails, function(err) {
				if (err) {
					console.log("spotify write log file error - " + err);
				} 
				// else
					// console.log("file appended");
			});
		}
	});
}

function getMovieDetails(movieName) {
	var request = require('request');
	//api key
	var id = require("./keys.js");
	var omdbID = id.omdbKey;
	var omdbIDKey = omdbID["apiKey"];
	// console.log(omdbIDKey);
	//api call
	var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=" + omdbIDKey;
	var movieDetails = "";
	request(queryUrl, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			// console.log(response);
			// console.log(body);
			//get rotten tomatoes rating
			var ratingVal="";
			var temp = JSON.parse(body).Ratings;
			// console.log("temp - " + temp);
			for (var i = 0; i < temp.length; i++) {
				// console.log(temp[i].Source);
				if(temp[i].Source==="Rotten Tomatoes"){
					ratingVal = temp[i].Value;
				}
			}
			movieDetails = "\nMOVIE DETAILS:\nMovie Title - " + JSON.parse(body).Title + 
				"\nThe year movie was made - " + JSON.parse(body).Year +
				"\nIMDB Rating - " + JSON.parse(body).imdbRating +
				"\nRotten Tomatoes Rating - " + ratingVal +
				"\nCountry where the movie was produced - " + JSON.parse(body).Country + 
				"\nLanguage of the movie - " + JSON.parse(body).Language +
				"\nPlot of the movie - " + JSON.parse(body).Plot +
				"\nActors in the movie - " + JSON.parse(body).Actors +
				"\n-------------------------------------\n";
			console.log(movieDetails);
			//append to log file
			fs.appendFile("log.txt", movieDetails, function(err) {
				if (err) {
					console.log("spotify write log file error - " + err);
				}
			});
		}
	});
}

function doWhatItSays() {
	//read file and process
	fs.readFile("random.txt","utf8", function(err, data){
		if (err) {
	    	console.log("read file error - " + err);
	  	} else {
	  		// console.log(data);
	  		var dataArr = data.split(",");
	  		// console.log(dataArr);
	  		switch (dataArr[0]) {
	  			case "my-tweets":
					myTweets();
					break;
				case "spotify-this-song":
					var songName = dataArr[1];
					songName = songName.substring(1,songName.length-1);
					getSongDetails(songName);
					break;
				case "movie-this":
					var movieName = dataArr[1];
					movieName = movieName.substring(1,movieName.length-1);
					getMovieDetails(movieName);
					break;
	  		}
	  	}
	});
}