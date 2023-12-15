# YouTubeMusic DiscordRichPresence
Shows YouTubeMusic as Discord Rich Presence

## Screenshots
Playing: \
<img src="https://raw.githubusercontent.com/presto1241/YouTubeMusic-Discord-Rich-Presence/master/ReadMeAssets/RichPresenceExamplePlaying.png" alt="alt text" width="300"/> \
Paused: \
<img src="https://raw.githubusercontent.com/presto1241/YouTubeMusic-Discord-Rich-Presence/master/ReadMeAssets/RichPresenceExamplePaused.png" alt="alt text" width="300"/> 

![alt text](https://raw.githubusercontent.com/presto1241/YouTubeMusic-Discord-Rich-Presence/master/ReadMeAssets/TerminalExample.png)
Lol just realized the screenshot has a bug... All my fellas is made by frizk not the other person. I'll fix that if I come across it again...

### Step 1:
Download the Repo & install the dependencies (express & discord-rich-presence) with npm
When you have downloaded the repo, first type in your terminal of choice: npm install
This will install all the needed dependencies first.

### Step 2:
Set your ID from your Discord Application
**const client = require('discord-rich-presence')('YOUR ID HERE')**\
**If you haven't created a discord application you can do so [here](https://discord.com/developers/applications)** <br>
<img src="https://raw.githubusercontent.com/presto1241/YouTubeMusic-Discord-Rich-Presence/master/ReadMeAssets/CreateApplication.png" alt="alt text" width="400"/> \
You can create an application by pressing, "New application" on the top right. Then naming the application, "Youtube music".
Then you can get your application ID by copying it, located in general information.\
<img src="https://raw.githubusercontent.com/presto1241/YouTubeMusic-Discord-Rich-Presence/master/ReadMeAssets/ApplicationId.png" alt="alt text" width="500"/> 

### Step 3
Enable in Chrome at Extensions the developer mode and load the Extension from the dir named **ChromeExtension**

### Step 4
Open a command promt in the directory where the repo files are and type **npm start**

### Step 5
Have fun :3


___
### What does this fork change?
This fork adds the abillity to play/pause your track and have it show up on discord that you paused it.
This fork also adds support for loading song images in the presence.
