var ready = false;
var Song_Title;
var Song_Artist;
var Song_Image;
var Song_Image_Blur;
var Line_Seperator;
var StartingTime = Date.now();
var songSwitchState = 0;
var lastSong = "";

var ConfigCache = {

    "DiscordAppID": "",
    "DiscordConfigValues": {
      "SongInfo": "${song}",
      "SongArtist": "${artistRaw}",
      "enabled": false
    },
    "VRChatSongInfo": {
      "value": "Listening to: ${song} by ${artist}",
      "enabled": false
    }
    
};
var SongCache;
const ws = new WebSocket('ws://127.0.0.1:52310');

document.addEventListener("DOMContentLoaded", function(e) {

    Song_Title = document.getElementsByClassName("Song_Text")[0];
    Song_Artist = document.getElementsByClassName("Song_Artist")[0];
    Song_Image = document.getElementsByClassName("Song_Image")[0];
    Song_Image_Blur = document.getElementsByClassName("bokahImage")[0];
    Line_Seperator = document.getElementsByClassName("lineSeperator")[0];
    //Song_Image_Blur.classList.add("bokahImageScroll");
    Song_Image.addEventListener("animationend", ImageAnimEnd);
    Line_Seperator.addEventListener("animationend", LineSeperatorAnimEnd);
    Song_Title.addEventListener("animationend", TitleTextAnimEnd);
    ready = true;
});


function ImageAnimEnd(){

    if (songSwitchState == 2){

        Line_Seperator.classList.add("blockfadeout");

        songSwitchState = 3;
        return;
    }

    if(songSwitchState == 4){

        Line_Seperator.classList.add("blockfadein");
        Line_Seperator.classList.remove("blockfadeout");

        songSwitchState = 5;
        return;
    }

};

function LineSeperatorAnimEnd(){

    if (songSwitchState == 3){
        Song_Image.style.backgroundImage = "url(" + content.img +")";
        Song_Image_Blur.style.backgroundImage = "url(" + content.img +")";
    
        Song_Artist.children[0].innerText = content.artist[0].replace(/(\r\n|\n|\r)/gm,"");
        resize2fit(Song_Artist);
    
        Song_Title.children[0].innerText = ConfigCache.DiscordConfigValues.SongInfo.interpolate(SongCache);
        resize2fit(Song_Title);


        Song_Image.classList.add("imagefadein");
        Song_Image_Blur.classList.add("imagefadein");
        Song_Image.classList.remove("imagefadeout");
        Song_Image_Blur.classList.remove("imagefadeout");

        //Song_Image_Blur.classList.add("bokahImageScroll");
        songSwitchState = 4;
        return;
    }

    if (songSwitchState == 5){

        Song_Artist.classList.add("text_fadein");
        Song_Title.classList.add("text_fadein");
        Song_Artist.classList.remove("text_fadeout");
        Song_Title.classList.remove("text_fadeout");

        songSwitchState = 6;
        return;
    }

}


function TitleTextAnimEnd(){


    if(songSwitchState == 1){
        
        Song_Image.classList.add("imagefadeout");
        //Song_Image_Blur.classList.remove("bokahImageScroll");
        Song_Image_Blur.classList.add("imagefadeout");
        

        songSwitchState = 2;
        return;
    }


    if(songSwitchState == 6){

        Song_Artist.classList.remove("text_fadein");
        Song_Title.classList.remove("text_fadein");
        Line_Seperator.classList.remove("blockfadein");
        Song_Image.classList.remove("imagefadein");
        Song_Image_Blur.classList.remove("imagefadein");

        songSwitchState = 0;
        return;
    }
    /*
    Song_Image.style.backgroundImage = "url(" + content.img +")";
    Song_Image_Blur.style.backgroundImage = "url(" + content.img +")";

    Song_Artist.children[0].innerText = "by " + content.artist[0].replace("\n","");
    resize2fit(Song_Artist);

    Song_Title.children[0].innerText = content.song;
    resize2fit(Song_Title);
    */
}



ws.onmessage = function(message){
    content = JSON.parse(message.data);
    console.log(content);

    if (!["data", "configupdate", "config"].includes(content.type)) { console.log("Made it here!"); return;}
    
    if (content.type == "config") {

        ConfigCache = content;
        Song_Title.children[0].innerText = ConfigCache.DiscordConfigValues.SongInfo.interpolate(SongCache);

        return;
    }

    if (content.type == "data"){

        SongCache = content;
    }

    if (content.song == lastSong) {

        if (content.type == "configupdate")
        {

            ws.send(JSON.stringify({ type: "config" }));


        }

        return;
    }
    lastSong = content.song;

    if (!ready) return;

    if ( songSwitchState == 0){
        Song_Artist.classList.add("text_fadeout");
        Song_Title.classList.add("text_fadeout");
        songSwitchState = 1;
    } else {
        Song_Image.style.backgroundImage = "url(" + content.img +")";
        Song_Image_Blur.style.backgroundImage = "url(" + content.img +")";
    
        Song_Artist.children[0].innerText = content.artist[0].replace(/(\r\n|\n|\r)/gm,"");
        resize2fit(Song_Artist);
    
        Song_Title.children[0].innerText = ConfigCache.DiscordConfigValues.SongInfo.interpolate(SongCache);
        resize2fit(Song_Title);

    }
};



//gre_gor on stack overflow made a really nice helper function for setting font size based on character amount.
//https://stackoverflow.com/questions/18229230/dynamically-change-the-size-of-the-font-size-based-on-text-length

function resize2fit(el) {
    if (!el.parentElement) return;
    el.style.setProperty("--font-size", "1em");
    const {width: max_width, height: max_height} = el.getBoundingClientRect();
    const {width, height} = el.children[0].getBoundingClientRect();
    el.style.setProperty("--font-size", Math.min(max_width/width, max_height/height)+"em");
}

var YOffset = 0;

function Update(){

    if(!ready) return;
    
    Song_Image_Blur.style.backgroundPosition = "50% "+ -YOffset+"%";
    
    YOffset += 0.5;
}



setInterval(Update, 60);


String.prototype.interpolate = function(params) {
    const names = Object.keys(params);
    const vals = Object.values(params);
    try{
        return new Function(...names, `return \`${this}\`;`)(...vals);
    }catch(e){ return this;}
}