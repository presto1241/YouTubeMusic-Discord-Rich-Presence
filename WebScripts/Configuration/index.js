
var ready = false;

var OverlayStatus = {

    Overlay: undefined,
    Status_Text: undefined,
    LoadingDots: undefined,
    AppIDElement: undefined,
    AppIDBox: undefined,
    AppIDBtn: undefined
};

var DiscordPreview;
var VRChatPreview;

var DiscordConfig;
var VRChatConfig;

var DiscordOptionClick;
var VRChatOptionClick;

var CurrentEditText;

var timeElement;
var remainingTime;
var remainingDateTime;

var songContent;
var messageConfig;

var ConfigCache;

var editIndex = 0;

const PreviewMap = new Map();
const ConfigMap = new Map();
const NameMap = new Map();

const ws = new WebSocket('ws://127.0.0.1:52310');

ws.onopen = function(event) {

    ws.send(JSON.stringify({ type: "config" }));

    console.log('Client connected!');

}

document.addEventListener("DOMContentLoaded", function(e) {

    OverlayStatus.Overlay = document.getElementsByClassName("OverlayLoadingStatus")[0];
    OverlayStatus.Status_Text = document.getElementsByClassName("OverlayLoadingText")[0];
    OverlayStatus.LoadingDots = document.getElementsByClassName("col-3")[0];
    OverlayStatus.AppIDElement = document.getElementsByClassName("AppIDInput")[0];
    OverlayStatus.AppIDBox = document.getElementsByClassName("AppIDInputBox")[0];
    OverlayStatus.AppIDBtn = document.getElementsByClassName("AppIDBtn")[0];
    

    DiscordPreview = document.getElementsByClassName("DiscordPreview")[0];
    VRChatPreview = document.getElementsByClassName("VRChatPreview")[0];

    DiscordConfig = document.getElementsByClassName("DiscordConfig")[0];
    VRChatConfig = document.getElementsByClassName("VRChatConfig")[0];

    DiscordOptionClick = document.getElementById("optDiscord");
    VRChatOptionClick = document.getElementById("optVRChat");

    timeElement = document.getElementsByClassName("DiscordTime")[0];

    CurrentEditText = document.getElementsByClassName("Game-Editing-Status")[0];


    PreviewMap.set(0, DiscordPreview);
    PreviewMap.set(1, VRChatPreview);

    ConfigMap.set(0, DiscordConfig);
    ConfigMap.set(1, VRChatConfig);

    NameMap.set(0, "Discord");
    NameMap.set(1, "VRChat");

    DiscordOptionClick.addEventListener("click", DiscordConfigToggle);
    VRChatOptionClick.addEventListener("click", VRChatConfigToggle);
    document.getElementsByClassName("AppID-Button")[0].addEventListener("click", promptAppIDSet);
    document.getElementsByClassName("AppIDBtn")[0].addEventListener("click", SubmitnewAppID);
    document.getElementsByClassName("Save-Button")[0].addEventListener("click", SaveSettings);
    document.getElementsByClassName("Status-Enable-Button")[0].addEventListener("click", EnablePresence);
    document.getElementsByClassName("Status-Disable-Button")[0].addEventListener("click", DisablePresence);


    document.getElementsByClassName("DiscordSongInfoTextarea")[0].addEventListener("input", ModifyDiscordConfigCache);
    document.getElementsByClassName("DiscordSongArtistTextarea")[0].addEventListener("input", ModifyDiscordConfigCache);
    document.getElementsByClassName("VRChatTextarea")[0].addEventListener("input", ModifyVRChatConfigCache);
    

    OverlayStatus.Overlay.classList.add("display");
    OverlayStatus.Status_Text.innerText = "Loading...";
    OverlayStatus.LoadingDots.classList.add("display");

    ready = true;
    SetEditingConfig(0);

});


function DiscordConfigToggle(){
    SetEditingConfig(0);
}

function VRChatConfigToggle(){
    SetEditingConfig(1);
}



function SetEditingConfig(index){

    editIndex = index;
    targetPreview = PreviewMap.get(index);
    targetConfig = ConfigMap.get(index);
    targetName = NameMap.get(index);

    DiscordPreview.classList.remove("display");
    VRChatPreview.classList.remove("display");

    DiscordConfig.classList.remove("display");
    VRChatConfig.classList.remove("display");

    targetPreview.classList.add("display");
    targetConfig.classList.add("display");

    CurrentEditText.innerText = `Currently editing presence for ${targetName}:`;

    if (editIndex == 0){

        document.getElementsByClassName("AppID-Button")[0].classList.add("display");

    }else{

        document.getElementsByClassName("AppID-Button")[0].classList.remove("display");

    }

    if (ConfigCache != undefined){

        if (editIndex == 0){
            SetStateButtons(ConfigCache.DiscordConfigValues.enabled)
        }
    
        if (editIndex == 1){
            SetStateButtons(ConfigCache.VRChatSongInfo.enabled)
        }

    }
}



function SaveSettings(){

    ConfigCache.type = "setconfig";
    ws.send(JSON.stringify(ConfigCache));

}

function EnablePresence() {

    if (editIndex == 0){

        if (ConfigCache.DiscordAppID == ""){

            promptAppIDSet();
            return;
        }
        ConfigCache.DiscordConfigValues.enabled = true;

    }

    if (editIndex == 1){

        ConfigCache.VRChatSongInfo.enabled = true;

    }

    SetStateButtons(true);
}

function DisablePresence() {

    if (editIndex == 0){

        ConfigCache.DiscordConfigValues.enabled = false;

    }

    if (editIndex == 1){

        ConfigCache.VRChatSongInfo.enabled = false;

    }

    SetStateButtons(false);

}

function SetStateButtons(state){

    if(!state){

        document.getElementsByClassName("Status-Enable-Button")[0].classList.add("display");
        document.getElementsByClassName("Status-Disable-Button")[0].classList.remove("display");

    }
    else{

        document.getElementsByClassName("Status-Enable-Button")[0].classList.remove("display");
        document.getElementsByClassName("Status-Disable-Button")[0].classList.add("display");

    }

}

ws.onmessage = function(message){

    let messageJSON = JSON.parse(message.data);


    if(!ready) return;

    if (messageJSON.type == "data"){

        songContent = messageJSON;
        songContent.artistRaw = songContent.artist.join(" • ");
        songContent.artist = songContent.artist[0];

        remainingDateTime = Date.now() + timeToJSMS(songContent.timeMax.trim()) - timeToJSMS(songContent.timestamp.trim()) ;
        remainingTime = remainingDateTime - Date.now();

        if (ConfigCache == undefined) return;
        let presenceUpdate = messageJSON;
        presenceUpdate.SongInfo = ConfigCache.SongInfo;
        presenceUpdate.SongArtist = ConfigCache.SongArtist;
        UpdateDiscordPresencePreview(presenceUpdate);
        UpdateVRChatPresencePreview(presenceUpdate);

    };

    if (messageJSON.type == "config"){


        ConfigCache = messageJSON;

        document.getElementsByClassName("VRChatTextarea")[0].value = ConfigCache.VRChatSongInfo.value;
        document.getElementsByClassName("DiscordSongInfoTextarea")[0].value = ConfigCache.DiscordConfigValues.SongInfo;
        document.getElementsByClassName("DiscordSongArtistTextarea")[0].value = ConfigCache.DiscordConfigValues.SongArtist;

        ModifyVRChatConfigCache();
        ModifyDiscordConfigCache();

        ws.send(JSON.stringify({ type: "data" }));
    
        if ( messageJSON.DiscordAppID == ""){
            
            promptAppIDSet();

        }else {OverlayStatus.Overlay.classList.remove("display");}
        
    };

}


function promptAppIDSet(){

    if(ConfigCache == undefined) return;

    OverlayStatus.Overlay.classList.add("display");
    OverlayStatus.Status_Text.innerText = "Please input discord presence AppID";
    OverlayStatus.LoadingDots.classList.remove("display");
    OverlayStatus.AppIDElement.classList.add("display");
    OverlayStatus.AppIDBox.value = ConfigCache.DiscordAppID;

}

function SubmitnewAppID(){

    if( ConfigCache == undefined) return;

   ConfigCache.DiscordAppID = OverlayStatus.AppIDBox.value;

   OverlayStatus.Overlay.classList.remove("display");

   ConfigCache.type = "setconfig";
   ws.send(JSON.stringify(ConfigCache));
}


function ModifyVRChatConfigCache(){

    ConfigCache.VRChatSongInfo.value = document.getElementsByClassName("VRChatTextarea")[0].value;
    document.getElementById("VRCPreviewinnertext").innerText = ConfigCache.VRChatSongInfo.value.interpolate(songContent);

    
    if (editIndex == 0){
        SetStateButtons(ConfigCache.DiscordConfigValues.enabled)
    }

    if (editIndex == 1){
        SetStateButtons(ConfigCache.VRChatSongInfo.enabled)
    }
}


function ModifyDiscordConfigCache(){

    songInfo = document.getElementsByClassName("DiscordSongInfoTextarea")[0].value;
    songArtist = document.getElementsByClassName("DiscordSongArtistTextarea")[0].value;

    ConfigCache.DiscordConfigValues.SongInfo = songInfo;
    ConfigCache.DiscordConfigValues.SongArtist = songArtist;


    let songElement = document.getElementsByClassName("DiscordSong")[0];
    let artistElement = document.getElementsByClassName("DiscordArtist")[0];
    songElement.innerText = ConfigCache.DiscordConfigValues.SongInfo.interpolate(songContent);
    artistElement.innerText = ConfigCache.DiscordConfigValues.SongArtist.interpolate(songContent);

    
    if (editIndex == 0){
        SetStateButtons(ConfigCache.DiscordConfigValues.enabled)
    }

    if (editIndex == 1){
        SetStateButtons(ConfigCache.VRChatSongInfo.enabled)
    }

}



function UpdateDiscordPresencePreview(content){

    let songElement = document.getElementsByClassName("DiscordSong")[0];
    let artistElement = document.getElementsByClassName("DiscordArtist")[0];
    let songImgElement = document.getElementsByClassName("DiscordBigimg")[0];


    songElement.innerText = ConfigCache.DiscordConfigValues.SongInfo.interpolate(content);
    artistElement.innerText = ConfigCache.DiscordConfigValues.SongArtist.interpolate(content);
    songImgElement.style.backgroundImage = `url(${content.img})`;
    timeElement.innerText = `${UTCtimetoString(remainingTime/1000)} left`;
    
    updatePlayImg(content.playing);
}

function UpdateVRChatPresencePreview(content){
    document.getElementById("VRCPreviewinnertext").innerText = ConfigCache.VRChatSongInfo.value.interpolate(content);
}


function updatePlayImg(playing){

    let playstateElement = document.getElementsByClassName("DiscordSmallimg")[0];

    let playingImg = !playing ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3bGDKsJ1uem8wUSsh1nxX5MG-qrqWAmU9qULlyLM&s" : "https://raw.githubusercontent.com/presto1241/YouTubeMusic-Rich-Presence/master/Assets/YTIconPause.png";

    playstateElement.style.backgroundImage = `url(${playingImg})`;

    if (playing) return;
    timeElement.innerText = "";
}


function oneHzUpdate(){

    if (!ready || songContent == undefined || !songContent.playing) return;

    timeLeft = remainingDateTime - Date.now();
    timeleftString = UTCtimetoString(timeLeft/1000);


    timeElement.innerText = `${timeleftString} left`;
    

}


setInterval(oneHzUpdate, 1000);





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

String.prototype.interpolate = function(params) {
    const names = Object.keys(params);
    const vals = Object.values(params);
    try{
        return new Function(...names, `return \`${this}\`;`)(...vals);
    }catch(e){ return this;}
}