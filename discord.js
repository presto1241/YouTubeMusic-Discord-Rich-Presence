const fs = require('fs');
const WebSocket = require('ws');

var Savefile = JSON.parse(ReadSavefile());
function ReadSavefile(){ return fs.readFileSync(process.cwd() + "/config.json");}

//Discord client connection
const client = require('discord-rich-presence')(Savefile.DiscordAppID);


const ws = new WebSocket('ws://127.0.0.1:52310');


ws.onmessage = function(message){

    let content = JSON.parse(message.data);
    Savefile = JSON.parse(ReadSavefile());

    if (!["data", "configupdate"].includes(content.type)) return;

    content.timeNow = Date.now();
    content.timeMax = Date.now() +  timeToJSMS(content.timeMax.trim()) - timeToJSMS(content.timestamp.trim());
    updateDiscord(content);
}


function updateDiscord(content) {
	
    songContent = content;
    songContent.artistRaw = songContent.artist.join(" • ");
    songContent.artist = songContent.artist[0];

    image = !songContent.playing ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3bGDKsJ1uem8wUSsh1nxX5MG-qrqWAmU9qULlyLM&s" : "https://raw.githubusercontent.com/presto1241/YouTubeMusic-Rich-Presence/master/Assets/YTIconPause.png";
  
    //////
    //Update discord presence to display current song information
    //////
  
    let state = Savefile.DiscordConfigValues.SongArtist.interpolate(songContent);
    let details = Savefile.DiscordConfigValues.SongInfo.interpolate(songContent);

    if(songContent.playing)
    {

      client.updatePresence({
        state: state,
        details: details,
        startTimestamp: songContent.timeNow,
        endTimestamp: songContent.timeMax,
        largeImageKey: songContent.img,
        smallImageKey: image,
        instance: true
      });

    }
    else
    {

      client.updatePresence({
        state: state,
        details: details,
        largeImageKey: songContent.img,
        smallImageKey: image,
        instance: true
      });

    }
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
      outputTime += parseFloat(time[i])/60 * Math.pow(60, colons - i);
    }
  
    //Multiply by 1000 to convert seconds to milliseconds.
    outputTime *= 1000;
    outputTime = Math.floor(outputTime);
  
    return currentDate + outputTime;
}
  







String.prototype.interpolate = function(params) {
    const names = Object.keys(params);
    const vals = Object.values(params);
    try{
        return new Function(...names, `return \`${this}\`;`)(...vals);
    }catch(e){ return this;}
}