const fs = require('fs');
const WebSocket = require('ws');

var Savefile = JSON.parse(ReadSavefile());
function ReadSavefile(){ return fs.readFileSync(process.cwd() + "/config.json").toString();}

//OSC reference
const OSC = require('osc-js');

var lastSong;
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

const OSCsocket = new OSC({ plugin: new OSC.BridgePlugin(config) })

const ws = new WebSocket('ws://127.0.0.1:52310');


ws.onmessage = function(message){

   let content = JSON.parse(message.data);
   Savefile = JSON.parse(ReadSavefile());

   if(lastSong != content.song) 
  {
    lastSong = content.song;
    UpdateVRChat(content);
  }

}


function UpdateVRChat(content){

    songContent = content;
    songContent.artistRaw = songContent.artist.join(" • ");
    songContent.artist = songContent.artist[0];

    Output = Savefile.VRChatSongInfo.value.interpolate(songContent);
    try{
        var message = new OSC.Message('/chatbox/input', Output.toString(), true);
        //console.log(message);
        OSCsocket.send(message);
    }
    catch(e) {console.log(`Websocket send error: ${e}`)}

}




String.prototype.interpolate = function(params) {
    const names = Object.keys(params);
    const vals = Object.values(params);
    try{
        return new Function(...names, `return \`${this}\`;`)(...vals);
    }catch(e){ return this;}
}
