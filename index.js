

var Discord = require('discord.js');
var mime = require('mime-types');
var fs = require('fs');
var utility = require('./my_modules/utility.js');
var cpanel = require('./my_modules/cpanel.js');

var bot = new Discord.Client();
var token = process.env.DISCORD_TOKEN || fs.readFileSync(".token",{encoding:'utf8'}).trim();
console.log(token);

///Constantes
var GUILDNAME = "bottester";
var DAYS = 4;
var PROGRESS_CHANNELS = ["progresso", "progresso_nsfw"];
var DEVROLE = "Devs";


utility.loadData();

bot.on('ready', function() {

  console.log("Pronto");

});

bot.on('guildMemberUpdate', function(oldMember , newMember) {

  var wasDev = oldMember.roles.find('name','Devs');
  var isDev = newMember.roles.find('name','Devs');

  if (wasDev && isDev == null)
  {
    utility.removeDev(newMember);
  }
  if (isDev && wasDev == null)
  {
    utility.addDev(newMember);
  }
});

bot.on('message', function(message) {

    if (PROGRESS_CHANNELS.indexOf(message.channel.name) != -1)
    {
        var attachments = message.attachments;
        var embeds = message.embeds;

        if (attachments.first() != undefined)
        {
          utility.processAttachments(message);
        }
        setTimeout(utility.processEmbeds,1000,message);
    }
});


bot.login(token);
