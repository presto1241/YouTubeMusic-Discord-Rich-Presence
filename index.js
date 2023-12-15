//Discord client connection
const client = require('discord-rich-presence')('Enter appId here!');

//Plugin reference
const express = require('express');

//Saving to text file
const fs = require('fs');



//////
//Initalize song variables and set then to their defualt state
//////
var song = 'Waiting for music...';
var artist = 'No Artist';
var tempTime = '0:00';
var image = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3bGDKsJ1uem8wUSsh1nxX5MG-qrqWAmU9qULlyLM&s";
var playing = false;
//var state = 0;


//////
//Initalize express as a variable and OSC as a variable
//////
const app = express();

console.log('Starting YouTubeMusicDiscordRichPresence...');


//////
//Run initial presence update. Will always return "Waiting for music" - "No artist"
//////
//update(song,artist);



//////
//Initalize express
//////
app.use(express.json());



//////
//Express.js start listening to localhost:3000.
//////
app.listen(3000, () => console.log('Listening to extension!'));




//////
//Listen for a post request on the express localhost:3000.
//////
app.post("/", (request, response) => {
  let content = request.body;
  response.sendStatus(200);
  //console.log(request)

  //////
  //Check if there is anything for song info since there has to be.
  //////
  //if(content.song == undefined || content.song == null || content.timeMax.replace(' ', '') == "0:00" || content.timeMax.replace(' ', '') == "") { return; }
  

  //////
  //Check if the current song is already being displayed by the script.
  //Everything that runs on song change goes in here.
  //////
  if(song != content.song) 
  {
    playing = false;
    song = content.song;

    updateVrchat(content.song, content.artist);

    console.log(`\n\n| Playing now ${content.song} by ${content.artist.split("\n • \n").join("\n| ")}\n| Time: ${content.timeMax.replace(' ', '')}`);
  }


  //////
  //This checks the scripts last state of paused or playing to see if the post was because song state changed.
  //////
  playing = content.playing;

  //////
  //Sending to function updateDiscord() containing all the information about the song playing, along with if the song is currently playing and how much time is left.
  //////
  updateDiscord(content.song, content.artist,Date.now(), Date.now() +  timeToJSMS(content.timeMax.trim()) - timeToJSMS(content.timestamp.trim()), content.img,content.playing);

});


function updateDiscord(song,artist,timeNow,timeMax,songImg,playing) {
	
  image = !playing ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3bGDKsJ1uem8wUSsh1nxX5MG-qrqWAmU9qULlyLM&s" : "https://raw.githubusercontent.com/presto1241/YouTubeMusic-Discord-Rich-Presence/master/Assets/YTIconPause.png";

  //////
  //Update discord presence to display current song information
  //////
  if(playing)
  {

    client.updatePresence({
      state: artist,
      details: song,
      startTimestamp: timeNow,
      endTimestamp: timeMax,
      largeImageKey: songImg,
      smallImageKey: image,
      instance: true
    });

  }
  else
  {

    client.updatePresence({
      state: artist,
      details: song,
      largeImageKey: songImg,
      smallImageKey: image,
      instance: true
    });

  }


  //////
  //Write the current song and artist to a text file "Song-Output.txt" located in the index.js folder in Text_Output/
	//////
  fs.writeFile( process.cwd() + "/Text_Output/Song-Output.txt", `${song} - ${artist.split("•")[0]}`, function (err){
		if (err) {
			return console.log(err);
    }
  });
     
}


//////
//Helper function that converts the YoutubeMusic timecode string to a Javascript based unix timestamp.
//////
function timeToJSMS(time){

  let currentDate = Date.now();
  
  //Evil typecasting string into Array[string]
  time = time.split(":");
  
  let colons = time.length;
  let outputTime = 0;

  //Foreach every ":" in the string input.
  for(i = 0; i < colons; i++)
  {
    //Use the power in math (pun intended) to convert hours/min/seconds to seconds.
    outputTime += parseInt(time[i])/60 * Math.pow(60, colons - i);
  }

  //Multiply by 1000 to convert seconds to milliseconds.
  outputTime *= 1000;

  return currentDate + outputTime;
}