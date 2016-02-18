var DubAPI = require('dubapi'),
    settings = require('./settings.json');

var genericDubTrackBot = {
  bot: null,

  // Initialization
  init: function(err, bot){
    if (err) return console.error(err);

    console.log('Running DubAPI v' + bot.version);

    this.bot = bot;

    this.bindEvents();

    this.bot.connect( settings.roomID );
  },

  // Binds API events
  bindEvents: function(){
    this.bot.on( 'error', this.error.bind(this) );
    this.bot.on( 'connected', this.connected.bind(this) );
    this.bot.on( 'disconnected', this.disconnected.bind(this) );

    this.bot.on( this.bot.events.chatMessage, this.chatMessage.bind(this) );
    this.bot.on( this.bot.events.roomPlaylistUpdate, this.songChange.bind(this) );
  },

  // When connected
  connected: function(){
    this.log( 'Connected' );
  },
  
  // When the bot disconnects
  disconnected: function(){
    this.log( 'Disconnected.' );
    this.bot.reconnect();
  },

  // Error handler
  error: function(){
    console.error(err);
  },

  // Chat message handler
  chatMessage: function(data){
    if(data && data.user){
      // link filter
      if( (data.message.search('http://') >= 0 || data.message.search('https://') >= 0) 
        && !this.bot.isStaff(data.user)
        && settings.linkFilter
      ){
        this.bot.moderateDeleteChat(data.id);
        this.bot.sendChat('Sorry @'+data.user.username+', you need to be a regular to post links in this room.');
      
      // commands
      }else if( data.message[0] == '!'){
        var command = data.message.substring(1);

        switch( command ){
          // Calculates estimated time to play
          case 'eta':
            if(settings.eta){
              var queueLength = this.bot.getTimeRemaining(),
                queue = this.bot.getQueue(),
                hit = false;

              for(song in queue){
                if(data.user.id == queue[song].user.id) hit = true;
                if(!hit) queueLength += queue[song].media.songLength;
              }

              var timeLeft = new Date( queueLength );

              if(hit){
                this.bot.sendChat( '@'+data.user.username+' your queue is due in '+this.doubleDigits( timeLeft.getMinutes() )+':'+this.doubleDigits( timeLeft.getSeconds() ) );
              }else{
                this.bot.sendChat( '@'+data.user.username+' you\'re currently not in the queue' );
              }
            }else{
              return false;
            }

            break;
          
          // Returns a link to the current song
          case 'link':
            if(settings.eta){
              var media = this.bot.getMedia(),
                  url = this.getURL(media);

              this.bot.sendChat( media.name+' '+url );
            }else{
              return false;
            }

            break;

          // Skips the current song (Mods and above only)
          case 'skip':
            if( this.bot.isMod( data.user ) ||
              this.bot.isManager( data.user ) ||
              this.bot.isOwner( data.user ) ||
              this.bot.isCreator( data.user ) ||
              settings.skip
            ){
              this.bot.moderateSkip();
            }else{
              this.bot.sendChat( '@'+data.user.username+' you do not have permission to perform this action.' );
            }

            break;

          // Removes the current DJ from the queue (Mods and above only)
          case 'remove':
            if( this.bot.isMod( data.user ) ||
              this.bot.isManager( data.user ) ||
              this.bot.isOwner( data.user ) ||
              this.bot.isCreator( data.user ) ||
              settings.remove
            ){
              this.bot.moderatePauseDJ( this.bot.getDJ().username );
            }else{
              this.bot.sendChat( '@'+data.user.username+' you do not have permission to perform this action.' );
            }

            break;

          default:
            // Returns a random custom array item
            if( settings.customCommands[ command ] && Array.isArray( settings.customCommands[ command ] ) ){
              this.bot.sendChat( this.getRandomArrayItem( settings.customCommands[ command ] ) );
            
            // Returns a custom command if any
            }else if( settings.customCommands[ command ] ){
              this.bot.sendChat( settings.customCommands[ command ] );
            
            }else{
              return false;
            }

            break;
        }
      }
    
      this.log(data.user.username + ': ' + data.message);
    }
  },

  // Song change handler
  songChange: function(data){
    if( data.lastPlay && settings.lastPlay ){
      this.bot.sendChat( 'Last play: '+data.lastPlay.media.name+' :arrow_up:'+data.lastPlay.score.updubs+' :heart:'+data.lastPlay.score.grabs+' '+this.getURL(data.lastPlay.media) );
    }
  },

  /* Tools */
  // Custom log with time stamp
  log: function(string){
    console.log( this.getDateAndTime()+' - '+string );
  },

  // Converts single digit numbers into double digit by adding a 0
  doubleDigits: function(num){
    if(num < 10){
      return '0'+num;
    }else{
      return num;
    }
  },

  // Returns the local date and time
  getDateAndTime: function(){
    time = new Date();

    return time.getFullYear()+'.'+this.doubleDigits( time.getMonth()+1 )+'.'+this.doubleDigits( time.getDate() )+' '+this.doubleDigits( time.getHours() )+':'+this.doubleDigits( time.getMinutes() )+':'+this.doubleDigits( time.getSeconds() ); 
  },

  // Returns an URL to the targeted media
  getURL: function(songData){
    if( songData.type == 'youtube' ){
      return 'https://www.youtube.com/watch?v='+songData.fkid;
    }else{
      return songData.streamUrl;
    }
  },

  // Returns a random item from an array
  getRandomArrayItem: function(array){
    var num = Math.floor( Math.random() * array.length );
    return array[ num ];
  }
}

new DubAPI( settings.login, genericDubTrackBot.init.bind( genericDubTrackBot ) );