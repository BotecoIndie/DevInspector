var Discord = require('discord.js');
var utility = require('./my_modules/utility.js');
var fs = require('fs');
var path = require('path');

// Check if the data folder exists, if not, creates it
if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data');
}

// Check if .token file exists
if (!fs.existsSync('.token')) {
  throw new Error('The file .token does not exist!');
}

//Load all command modules
fs.readdir('./commands/', (err, files) => {
  if (!err) {
    console.log('loading command scripts...');
    files.forEach(file => {
      console.log(file);
      require('./commands/' + file);
    });
  } else {
    throw err;
  }
});

var LOGTYPE = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
};

var token = process.env.DISCORD_TOKEN || fs.readFileSync('.token', { encoding: 'utf8' }).trim();

utility.loadConfig();
var bot = new Discord.Client();
utility.loadBot(bot);

/*Hooks*/
bot.on('ready', function() {
  utility.writeLog('Successfully logged in.', LOGTYPE.INFO);

  setInterval(function() {
    fs.readdir(path.resolve(process.cwd(), './data/'), function(err, files) {
      if (err) {
        throw err;
      }
      for (var i = 0; i < files.length; i++) {
        var jsonPath = path.resolve(process.cwd(), './data/', files[i], './data.json');

        var serverId = files[i];
        fs.readFile(jsonPath, { encoding: 'UTF8' }, function(err2, data) {
          if (err2) {
            throw err2;
          }
          var obj = JSON.parse(data);
          if (obj.devs) {
            for (var j = 0; j < obj.devs.length; j++) {
              if (Date.now() - obj.devs[j].time > utility.configObj.days * 86400000) {
                utility.removeDev({
                  id: obj.devs[j].id,
                  guild: {
                    id: serverId,
                  },
                });
              }
            }
          }
        });
      }
    });
  }, 3600000);
});

bot.on('guildMemberUpdate', function(oldMember, newMember) {
  var wasDev = oldMember.roles.find('name', utility.configObj.devRole);
  var isDev = newMember.roles.find('name', utility.configObj.devRole);

  if (wasDev && isDev == null) {
    utility.removeDev(newMember);
  }
  if (isDev && wasDev == null) {
    utility.addDev(newMember);
  }
});

bot.on('message', function(message) {
  utility.processCommands(message);
});

bot.on('disconnect', function(closeEvent) {
  utility.writeLog('Disconnected.', LOGTYPE.INFO);
  bot.login(token);
});

bot.on('messageReactionAdd', function(messageReaction, user) {
  if (!messageReaction.message.guild.member(user).hasPermission('ADMINISTRATOR')) {
    return;
  }
  if (messageReaction.message.channel.id != utility.configObj.outputChannel) {
    return;
  }
  if (messageReaction.message.member.id != '294470644526088192') {
    return;
  } //TROCAR DEPOIS
  if (messageReaction.message.guild.member(user).id == '294470644526088192') {
    return;
  } //TROCAR DEPOIS
  if (messageReaction.message.embeds.length == 0) {
    return;
  }

  var memberId = '';
  for (var i = 0; i < messageReaction.message.embeds[0].fields.length; i++) {
    var field = messageReaction.message.embeds[0].fields[i];
    if (field.name == 'Member ID') {
      memberId = field.value;
      break;
    }
  }
  if (memberId == '') {
    return;
  }

  switch (messageReaction.emoji.toString()) {
    case '✅':
      utility.addDev({
        id: memberId,
        guild: {
          id: messageReaction.message.guild.id,
        },
      });
      messageReaction.message.delete().catch(console.error);
      break;
    case '❌':
      messageReaction.message.delete().catch(console.error);
      break;
  }
});

process.on('uncaughtException', function(err) {
  utility.writeLog(err.stack, LOGTYPE.ERROR);
});

bot.login(token);
