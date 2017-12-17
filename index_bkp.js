var Discord = require("discord.js");
var bot = new Discord.Client();
var mime = require('mime-types');
var fs = require('fs')

var token = process.env.DISCORD_TOKEN || fs.readFileSync(".token");
///Constantes
var GUILDNAME = "bottester";
var DAYS = 4;
var PROGRESS_CHANNEL = "progresso";
var DEVROLE = "Devs";
var NSFW_CHANNEL = "progresso_nsfw";

var devArray = [];
var imageArray = [];


function Dev(member,name,avatar)
{
  this.member = member;
  this.name = name;
  this.avatar = avatar;
  this.timer = 86400 * DAYS;
}

function Image(url,name,type,postTime)
{
  this.url = url;
  this.name = name;
  this.type = type;
  this.postTime = postTime;
}

function assignDev(name, assignOnGuild)
{
  var user = null;

  for(i=0; i<devArray[i];i++)
  {
    if (devArray[i].name == name)
    {
      user = devArray[i];
      break;
    }
  }

  if (user == null)
  {
    var col = bot.guilds.find("name",GUILDNAME).members;
    var arr = Array.from(col.values());
    for(i=0;i<arr.length;i++)
    {
      if (arr[i].displayName == name)
      {
          devArray.push(new Dev(arr[i],arr[i].displayName,arr[i].user.displayAvatarURL));

          if (assignOnGuild)
          {
            var devRole = bot.guilds.find("name",GUILDNAME).roles.find("name",DEVROLE);

            arr[i].addRole(devRole).then(function(){
              console.log("Dev Adicionado");
            }).catch(function(){
              console.log("Promessa recusada");
            });
          }
          break;
      }
    }

  }
  else
  {
    if (assignOnGuild)
    {
      var devRole = bot.guilds.find("name",GUILDNAME).roles.find("name",DEVROLE);

      user.member.addRole(devRole).then(function(){
        console.log("Dev Adicionado");
      }).catch(function(){
        console.log("Promessa recusada");
      });
    }
  }

}

function removeDev(name, removeFromGuild)
{

  for(i=0; i<devArray[i];i++)
  {
    if (devArray[i].name == name)
    {
      devArray.splice(i,1);
      break;
    }
  }

    if (!removeFromGuild)  {return;}

    var col = bot.guilds.find("name",GUILDNAME).members;
    var arr = Array.from(col.values());
    for(i=0;i<arr.length;i++)
    {
      if (arr[i].displayName == name)
      {
            var devRole = bot.guilds.find("name",GUILDNAME).roles.find("name",DEVROLE);

            arr[i].removeRole(devRole).then(function(){
              console.log("Dev Removido");
            }).catch(function(){
              console.log("Promessa recusada");
            });
          break;
      }
    }

}

bot.on('ready', function() {

  console.log('Bot Pronto');
  removeDev("Led",true);

  var col = bot.guilds.find("name",GUILDNAME).roles.find("name",DEVROLE).members;
  var arr = Array.from(col.values());
  for(i = 0; i<arr.length;i++)
  {
      var member = arr[i];
      var username = arr[i].displayName;
      var avatarURL = arr[i].user.displayAvatarURL;

      devArray.push(new Dev(member,username,avatarURL));
  }

  setInterval(function(){
    for(i=0;i<devArray.length;i++)
    {
      devArray[i].timer -= 15;

      if (devArray[i].timer<1)
      {
        removeDev(devArray[i].name,true);
      }
    }

    //AQUI NÓS VAMOS CHECAR SE O TIMER DE ALGUM DELES É MENOR QUE 0 E SE A LISTA DE DEVS DO SERVIDOR MUDOU.
  },15000);

});

bot.on('message', function(message) {

  if (message.channel.name == PROGRESS_CHANNEL || message.channel.name == NSFW_CHANNEL)
  {
      if (message.attachments.first())
      {
          var type = "null";
          var url = message.attachments.first().url;
          var name = message.member.displayName;
          var postTime = message.createdAt;
          var mimetype = mime.lookup(url);

          if (mimetype.indexOf("image") != -1)
          {
            type = "image";
          }
          else if (mimetype.indexOf("video") != -1)
          {
            type = "video";
          }
          else if (mimetype.indexOf("audio") != -1)
          {
            type = "audio";
          }
          //Checar youtube ou o default, que seria download;

          imageArray.push(new Image(url,name,type,postTime));
          console.log(imageArray);


      }
  }

});



bot.login(token);
