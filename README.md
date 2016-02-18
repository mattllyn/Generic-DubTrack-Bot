# Generic DubTrack Bot
A small generic bot for DubTrack rooms

## Features
- Link filter
- Display last played song with updubs grabs
- Fast moderation for skipping or removal of DJ
- ETA command for when song is due
- Link command for URL to the current song
- Custom commands

## Setup
Generic-DubTrack-Bot runs on node and requires [DubAPI]: https://github.com/anjanms/DubAPI<br>
1. Install node if not already installed<br>
2. Download **Generic-DubTrack-Bot** and extract it to a desired folder<br>
3. Install the **DubAPI**<br>
4. Edit settings.json to your desire<br>
5. Issue the command ```node bot.js``` to run the bot<br>
6. Profit

## Settings
Setting | Description | Options
--- | --- | ---
login | login information for the bot's account | strings   
roomID | ID od the desired DubTrack room | string    
linkFilter | Link filter (does not affect staff) | True/False
eta | !eta command (calculates time til play) | True/False
lastPlay | Display last played song with stats | True/False
link | !link command (links current song) | True/False
skip | !skip command (mods and above only)| True/False
remove | !remove command (mods and above only) | True/False

### Custom commands
One can add custom commands like social media link or information simply by adding them as properties

For example the following will add a !github command that will make the bot post the link in chat
```json
"customCommands":{
  "github": "https://github.com/knifftech"
}
```

In addition one can add an array of items and the bot will randomly pick one of the items in the array
Shown here with the example of a !joke command
```json
"customCommands":{
  "joke": [
    "Our wedding was so beautiful, even the cake was in tiers.",
    "Did you hear about the new restaurant on the moon? The food is great, but there's just no atmosphere.",
    "I went to a book store and asked the saleswoman where the Self Help section was, she said if she told me it would defeat the purpose.",
    "What did the mountain climber name his son? Cliff."
  ]
}
```

**Note that valid JSON syntax is needed**
