//Plugin reference
const express = require('express');
const opener = require('opener');
const { fork } = require('child_process');

//Saving to text file
const fs = require('fs');


if (!fs.existsSync(process.cwd() + "/config.json")) fs.writeFileSync( process.cwd() + "/config.json", fs.readFileSync(process.cwd() + "/config.template.json"));
var Savefile = JSON.parse(ReadSavefile());
function ReadSavefile(){ return fs.readFileSync(process.cwd() + "/config.json").toString();}


//Websocket for html pages
const WebSocket = require('ws');

var Processes = 
{
  Discord: undefined,

  VRChat: undefined
}


//////
//Config file for the OSC connection.
//////
const config = {     

  receiver: 'udp',
  udpServer: {
      host: '0.0.0.0', //0.0.0.0 is basically 127.0.0.1...
      port: 9000,
      exclusive: false
  },
  udpClient: {
      host: '0.0.0.0',
      port: 9000
  }
}

//That port was a random number I typed in my keyboard :)
const wss = new WebSocket.Server({ port: 52310});


//////
//Initalize song variables and set then to their defualt state
//////
var song = 'Waiting for music...';
var artist = 'No Artist';
var tempTime = '0:00';
var image = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3bGDKsJ1uem8wUSsh1nxX5MG-qrqWAmU9qULlyLM&s";
var playing = false;
var content = {

  song: "Waiting for music...",
  artist: ["No artist", "0 views", "0 dislikes"],
  img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3bGDKsJ1uem8wUSsh1nxX5MG-qrqWAmU9qULlyLM&s",
  timeNow: "0:00",
  timeMax: "0:00",
  timestamp: "0:00"
};

var lastUpdate = Date.now();


//////
//Initalize express as a variable.
//////
const app = express();

console.log('Starting YouTubeMusicDiscordRichPresence...');






//////
//Run initial presence update. Will always return "Waiting for music" - "No artist"
//////
//update(song,artist);
wss.on('connection', function(client){

  if(content == undefined) return;
  WebsocketSendClient(content, "data", client);

  client.on('message', function(message) {

    message = JSON.parse(message);
    if(message.type == "config") {
  
      WebsocketSendClient(JSON.parse(ReadSavefile()), "config", client);
  
    };
  
    if(message.type == "setconfig") {
  
      UpdateConfig(message);
  
    }

    if(message.type == "data") {
  
      if (content == undefined) return;
      WebsocketSendClient(content, "data", client);
  
    }

  });

});





//////
//Initalize express
//////
app.use(express.json());
//const OSCsocket = new OSC({ plugin: new OSC.BridgePlugin(config) })



//////
//Express.js start listening to localhost:3000.
//////
app.listen(3000, function(){console.log('Listening to extension!'); opener( process.cwd() + "/WebScripts/Configuration/index.html");});

KillOrSpawnProcesses();


//////
//Listen for a post request on the express localhost:3000.
//////
app.post("/", (request, response) => {
  content = request.body;
  lastUpdate = Date.now();
  content.artist = content.artist.split("\n • \n");
  response.sendStatus(200);
  //console.log(request)

  //////
  //Check if there is anything for song info since there has to be.
  //////
  //if(content.song == undefined || content.song == null || content.timeMax.replace(' ', '') == "0:00" || content.timeMax.replace(' ', '') == "") { return; }
  if (content.song == "Waiting for track...") return;

  //////
  //Check if the current song is already being displayed by the script.
  //Everything that runs on song change goes in here.
  //////
  if(song != content.song) 
  {
    playing = false;
    song = content.song;

    //updateVrchat(content.song, content.artist);

    console.log(`\n\n| Playing now ${content.song} by ${content.artist.join("\n| ")}\n| Time: ${content.timeMax.replace(' ', '')}`);
  }


  //////
  //This checks the scripts last state of paused or playing to see if the post was because song state changed.
  //////
  playing = content.playing;

  //////
  //Sending to function updateDiscord() containing all the information about the song playing, along with if the song is currently playing and how much time is left.
  //////
  //updateDiscord(content.song, content.artist.join(" • "),Date.now(), Date.now() +  timeToJSMS(content.timeMax.trim()) - timeToJSMS(content.timestamp.trim()), content.img,content.playing);

  //Send connected sockets object also...
  WebsocketSendAllClients(content, "data");

});


function UpdateConfig(newConfig){

  //console.log(newConfig);
  if (newConfig.DiscordAppID != undefined){

    Savefile.DiscordAppID = newConfig.DiscordAppID;

  };

  if (newConfig.DiscordConfigValues != undefined){

    Savefile.DiscordConfigValues = newConfig.DiscordConfigValues;
    
  };

  if (newConfig.VRChatSongInfo != undefined){

    Savefile.VRChatSongInfo = newConfig.VRChatSongInfo;
    
  };

  //console.log(Savefile);

  fs.writeFileSync(process.cwd() + "/config.json", JSON.stringify(Savefile, null, 2));

  KillOrSpawnProcesses();

  let timestampOffset = Date.now() - lastUpdate;
  let timestampFloat = timeToJSMS(content.timestamp, false);

  let timestampOffsetstringConvert = UTCtimetoString( (timestampFloat + timestampOffset)/1000 );

  content.timestamp = timestampOffsetstringConvert;

  console.log(content);
  WebsocketSendAllClients(content, "configupdate");
  console.log("Updated config and sent the message");

}

function WebsocketSendAllClients(content, type){

  content.type = type;

  //Send connected sockets object also...
  wss.clients.forEach(client => {
    client.send(JSON.stringify(content));
  });
}

function WebsocketSendClient(content, type, client){

  content.type = type;

  //console.log(JSON.stringify(content));
  client.send(JSON.stringify(content));
}



//////
//Helper function that converts the YoutubeMusic timecode string to a Javascript based unix timestamp.
//////
function timeToJSMS(time, ifdate){

  let currentDate = Date.now();
  
  //Evil typecasting string into Array[string]
  time = time.split(":");
  
  let colons = time.length;
  let outputTime = 0;

  //Foreach every ":" in the string input.
  for(i = 0; i < colons; i++)
  {
    //Use the power in math (pun intended) to convert hours/min/seconds to seconds.
    outputTime += parseFloat(time[i])/60 * Math.pow(60, colons - i);
  }

  //Multiply by 1000 to convert seconds to milliseconds.
  outputTime *= 1000;
  outputTime = Math.floor(outputTime);

  if(ifdate){
    return currentDate + outputTime;
  }
  else{
    return outputTime;
  }
}


function KillOrSpawnProcesses(){

  Savefile = JSON.parse(ReadSavefile());
  if(Savefile.DiscordConfigValues.enabled){

    if(Processes.Discord == undefined) Processes.Discord = fork( "./discord.js");

    //Processes.Discord.stdout.pipe(process.stdout);

  } else {

    if(Processes.Discord != undefined) {
      Processes.Discord.kill();
      Processes.Discord = undefined;
    }
  }

  if(Savefile.VRChatSongInfo.enabled){

    if(Processes.VRChat == undefined) Processes.VRChat = fork( "./vrchat.js");
    //Processes.VRChat.stdout.pipe(process.stdout);
  } else {

    if(Processes.VRChat != undefined) {
      Processes.VRChat.kill();
      Processes.VRChat = undefined;
    }
  }

}




function UTCtimetoString(time){
  if (time < 0) time = 0;
  // Time calculations for days, hours, minutes and seconds
  var days = Math.floor(time / 86400);
  //console.log("Diff ("+countDownTime+" - "+serverTime+"): " + seconds, "Days: " + days);
  var hoursLeft = Math.floor((time) - (days * 86400));
  var hours = Math.floor(hoursLeft / 3600);
  var minutesLeft = Math.floor((hoursLeft) - (hours * 3600));
  var minutes = Math.floor(minutesLeft / 60);
  var remainingSeconds = Math.floor(time % 60);
  //console.log($el.attr('id'), seconds, days, hours, hoursLeft, minutes, minutesLeft, remainingSeconds);
  // Maybe padStart(2,'0')  on the remainingSeconds
  // Write out the remaining time
  //console.log(hours);
  return (days ? days + "d " : '') + ((hours > 0) ? hours.toString().padStart(2, "0") + ":" : '') + ((hoursLeft || minutesLeft || true) ? minutes.toString().padStart(2, "0") + ":" : '') + (minutesLeft || remainingSeconds ? remainingSeconds.toString().padStart(2, "0") : '');
}