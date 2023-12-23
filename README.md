# YouTubeMusic RichPresence
Shows YouTubeMusic as Rich Presence

## Screenshots
Playing: \
<img src="https://raw.githubusercontent.com/presto1241/YouTubeMusic-Discord-Rich-Presence/master/ReadMeAssets/RichPresenceExamplePlaying.png" alt="alt text" width="300"/> \
Paused: \
<img src="https://raw.githubusercontent.com/presto1241/YouTubeMusic-Discord-Rich-Presence/master/ReadMeAssets/RichPresenceExamplePaused.png" alt="alt text" width="300"/> 

Config window: \
<img src="https://raw.githubusercontent.com/presto1241/YouTubeMusic-Discord-Rich-Presence/master/ReadMeAssets/ConfigPreview.png" alt="alt text" width="700"/> 

![alt text](https://raw.githubusercontent.com/presto1241/YouTubeMusic-Discord-Rich-Presence/master/ReadMeAssets/TerminalExample.png) \
Lol just realized the screenshot has a bug... All my fellas is made by frizk not the other person. I'll fix that if I come across it again...

### Step 1:
Download the Repo & install the dependencies (express & discord-rich-presence) with npm
When you have downloaded the repo, first type in your terminal of choice: npm install
This will install all the needed dependencies first.

### Step 2:
Enable in Chrome at Extensions the developer mode and load the Extension from the dir named **ChromeExtension**

### Step 3:
Open a command promt in the directory where the repo files are and type **npm start**

### Step 4:
Copy your ID from your Discord Application
**If you haven't created a discord application you can do so [here](https://discord.com/developers/applications)** <br>
<img src="https://raw.githubusercontent.com/presto1241/YouTubeMusic-Discord-Rich-Presence/master/ReadMeAssets/CreateApplication.png" alt="alt text" width="400"/> \
You can create an application by pressing, "New application" on the top right. Then naming the application, "Youtube music".
Then you can get your application ID by copying it, located in general information.\
<img src="https://raw.githubusercontent.com/presto1241/YouTubeMusic-Discord-Rich-Presence/master/ReadMeAssets/ApplicationId.png" alt="alt text" width="500"/> 

### Step 5:
In the config panel that just launched paste the ID from <b>Step 4:</b> into the text box and press `submit` <b>
Press the button `Enable status` and then click `Save changes`. Now you have discord presence enabled!

### Step 5
Have fun :3

___
### How to use config
Selecting which presence to edit can be done through the button `Select game`. <br>
You can format your text by using template literals formatting. `${}`<br>

All the usable variables are shown here:<br>
| Variable | Description |
| :------  |  :--------: |
| song | Displays the current song |
| artist\[0-2\] | Displays the details of the song \[ artist, album or views, year or likes \] |
| artistRaw | Displays the details of the song formatted to youtubes page |
| timestamp | Displays the time elapsed on the song as of last update |
| timeMax | Displays the song length |
| img | The image url of the song |

___
### What does this fork change?
Adds a websocket connection so external apps can easily pull the data of the presence. Along with a config to make customizing the presence easier.<br>
Adds support for song image and play/pause, and adds support for vrchat OSC.
