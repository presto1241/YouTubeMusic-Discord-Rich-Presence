var lastSong = undefined;
var songName = undefined;


var playback = document.getElementsByClassName("play-pause-button style-scope ytmusic-player-bar")[0];

var songName = document.getElementsByClassName("title style-scope ytmusic-player-bar")[0];

var timeinfo = document.getElementsByClassName("time-info style-scope ytmusic-player-bar")[0];

var imgurl = document.querySelector("#song-image #img");


var songInfo = 
{
    song: "",
    artist: "",
    timeMax: "",
    img: "",
    playing: false,
    timestamp: ""
};





var imgurl = document.querySelector("#song-image #img").getAttribute("src").toString();


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    sendResponse({
        response: "Message Received! (content)"
    });

    var requestMessage = false;

    if(document.getElementsByClassName("byline style-scope ytmusic-player-bar complex-string")[0] != undefined)  {
        songInfo.artist = document.getElementsByClassName("byline style-scope ytmusic-player-bar complex-string")[0].innerText; 
    }


    var imgurl = document.querySelector("#song-image #img").getAttribute("src").toString();
    //Figured out that when playing a video, images are actually a 1x1 base64 image. 
	if(imgurl.match(new RegExp("data:image/gif;base64")))
	{
        imgurl = document.querySelector(".thumbnail-image-wrapper img").getAttribute("src").toString();
	}

    if(songInfo.img != imgurl) requestMessage = true;
    songInfo.img = imgurl;


    var splitString = timeinfo.innerHTML.toString().split("/");

    //Idk why this errors tbh. I did have an if check to see if splitstring is undefined and it still went through.
    //So lazy try catch it is.
    try{
    songInfo.timeMax = splitString[1].trim();
    songInfo.timestamp = splitString[0].trim();
    }catch{}

    if (requestMessage) sendMessage();
});



//////
//This will listen for every time the play/pause button changes. Specifically the text in the button will change. So I can use this instead of listening to a page update.
//////

//Play/Pause Boolean
var playbackObserver = new MutationObserver(function(mutations) {
    //console.log(mutations);
    mutations.forEach(function(mutation) {
        if ( mutation.attributeName != "aria-label" ) return;
        songInfo.playing = mutation.target.getAttribute("aria-label") == "Pause";
        if (songInfo.song == "") return;
        sendMessage();
    });
    //console.log(songInfo);
});


playbackObserver.observe(playback, {
    attributes: true //configure it to listen to attribute changes
});



//Song Name string
var songNameObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if ( mutation.attributeName != "title" ) return;
        //console.log(mutation);
        songInfo.song = mutation.target.innerHTML;
    });

});

//console.log(songName);
songNameObserver.observe(songName, {
    attributes: true //configure it to listen to attribute changes
});



function sendMessage() {
    //if (songInfo.img == "") songInfo.img = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3bGDKsJ1uem8wUSsh1nxX5MG-qrqWAmU9qULlyLM&s";
    if (songInfo.song == "") songInfo.song = "Waiting for track...";
    if (songInfo.artist == "") songInfo.artist = "No artist";
    if (songInfo.img == "") return;

    console.log(songInfo);
    chrome.runtime.sendMessage( songInfo );
}