var fs = require('fs');
var path = require('path');

exports = module.exports = {
  bot: undefined,
  commands: [],
  configObj: {
    deleteDataOnServerExit: false,
    logLevel: 1,
    commandPrefix: '!',
    devRole: 'Devs',
    days: 7,
    progressChannels: [],
    outputChannel: '',
    showcaseChannel: '',
  },
  loadBot: function(bot) {
    exports.bot = bot;
  },
  loadConfig: function() {
    exports.configObj = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), './config.json')));
  },
  writeLog: function(string, logLevel) {
    console.log(string);
    if (logLevel <= exports.configObj.logLevel) {
      var type = '';
      if (logLevel == 1) {
        type = '[ERROR]';
      } else if (logLevel == 2) {
        type = '[WARN]';
      } else {
        type = '[INFO]';
      }

      var d = new Date();
      var write = '[' + d.toUTCString() + ']' + type + ' ' + string;
      var stream = fs.createWriteStream(path.resolve(process.cwd(), './log.txt'), { flags: 'a' });
      stream.write(write + '\n');
      stream.end();
    }
  },
  getMemberData: function(serverId, memberId) {
    if (!fs.existsSync(path.resolve(process.cwd(),'./data/' + serverId))) {
      return null;
    }
    if (!fs.existsSync(path.resolve(process.cwd(),'./data/' + serverId + '/' + memberId + '.json'))) {
      return null;
    }
    return JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), './data/' + serverId + '/' + memberId + '.json'))
    );
  },
  writeMemberData: function(serverId, memberId, data) {
    if (!fs.existsSync(path.resolve(process.cwd(), './data/' + serverId))) {
      fs.mkdirSync(path.resolve(process.cwd(), './data/' + serverId));
    }
    var stream = fs.createWriteStream(
      path.resolve(process.cwd(), './data/' + serverId + '/' + memberId + '.json')
    );
    if (typeof data == 'string') {
      stream.write(data);
    } else {
      stream.write(JSON.stringify(data));
    }

    stream.end();
  },
  modifyMemberProp: function(serverId, memberId, prop, value) {
    var obj = exports.getMemberData(serverId, memberId);
    obj[prop] = value;
    exports.writeMemberData(serverId, memberId, obj);
  },
  getServerData: function(serverId) {
    if (!fs.existsSync(path.resolve(process.cwd(), './data/' + serverId))) {
      return null;
    }
    if (!fs.existsSync(path.resolve(process.cwd(), './data/' + serverId + '/data.json'))) {
      return null;
    }
    return JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), './data/' + serverId + '/data.json'))
    );
  },
  writeServerData: function(serverId, data) {
    if (!fs.existsSync(path.resolve(process.cwd(), './data/' + serverId))) {
      fs.mkdirSync(path.resolve(process.cwd(), './data/' + serverId));
    }
    var stream = fs.createWriteStream(
      path.resolve(process.cwd(), './data/' + serverId + '/data.json')
    );
    if (typeof data == 'string') {
      stream.write(data);
    } else {
      stream.write(JSON.stringify(data));
    }
    stream.end();
  },
  modifyServerProp: function(serverId, prop, value) {
    var obj = exports.getServerData(serverId);
    obj[prop] = value;
    exports.writeServerData(serverId, obj);
  },
  sendMessage: function(data) {
    var toUser = exports.bot.guilds.get(data.serverId).channels.get(data.to) == undefined;

    if (!toUser) {
      var guild = exports.bot.guilds.get(data.serverId);
      channel = guild.channels.get(data.to);
    } else {
      var guild = exports.bot.guilds.get(data.serverId);
      channel = guild.members.get(data.to);
    }
    return channel.send(data.message, data.content || {});
  },
  createRole: function(serverId, data) {
    var guild = exports.bot.guilds.get(serverId);
    return guild.createRole({
      name: data.name,
      color: data.color || '#FFFFFF',
    });
  },
  removeRole: function(serverId, data) {
    var guild = exports.bot.guilds.get(serverId);
    var role = undefined;
    if (data.id) {
      role = guild.roles.get(data.id);
    } else if (data.name) {
      guild.roles.forEach(function(value, key) {
        if (value.name == data.name) {
          role = value;
        }
      });
    } else {
      return null;
    }
    if (role === undefined) {
      return null;
    }
    return role.delete();
  },
  hasRole: function(serverId, data) {
    var guild = exports.bot.guilds.get(serverId);
    if (data.id) {
      return guild.roles.get(data.id) != undefined;
    } else if (data.name) {
      var found = false;
      guild.roles.forEach(function(value, key) {
        if (value.name == data.name) {
          found = true;
        }
      });
      return found;
    }
    return false;
  },
  memberAddRole: function(serverId, memberId, data) {
    var guild = exports.bot.guilds.get(serverId);
    var member = guild.members.get(memberId);
    if (data.id) {
      return member.addRole(data.id);
    } else if (data.name) {
      var roleId = '';
      guild.roles.forEach(function(value, key) {
        if (value.name == data.name) {
          roleId = value.id;
        }
      });
      return member.addRole(roleId);
    }
    return null;
  },
  memberRemoveRole: function(serverId, memberId, data) {
    var guild = exports.bot.guilds.get(serverId);
    var member = guild.members.get(memberId);
    if (data.id) {
      return member.removeRole(data.id);
    } else if (data.name) {
      var roleId = '';
      member.roles.forEach(function(value, key) {
        if (value.name == data.name) {
          roleId = value.id;
        }
      });
      if (roleId == '') {
        return null;
      }
      return member.removeRole(roleId);
    }
    return null;
  },
  memberHasRole: function(serverId, memberId, data) {
    var guild = exports.bot.guilds.get(serverId);
    var member = guild.members.get(memberId);
    if (data.id) {
      return member.roles.get(data.id) != undefined;
    } else if (data.name) {
      var found = false;
      member.roles.forEach(function(value, key) {
        if (value.name == data.name) {
          found = true;
        }
      });
      return found;
    }
    return false;
  },
  getMemberById: function(serverId, memberId) {
    var guild = exports.bot.guilds.get(serverId);
    return guild.members.get(memberId);
  },
  getMemberByName: function(serverId, memberName) {
    var member = undefined;
    var guild = exports.bot.guilds.get(serverId);
    guild.members.forEach(function(value, key) {
      if (value.user.username == memberName) {
        member = value;
      }
    });
    return member;
  },
  checkMemberPermission: function(serverId, memberId, permissionString) {
    var member = exports.getMemberById(serverId, memberId);
    return member.hasPermission(permissionString);
  },
  getRoleById: function(serverId, roleId) {
    var guild = exports.bot.guilds.get(serverId);
    return guild.roles.get(roleId);
  },
  getRoleByName: function(serverId, roleName) {
    var role = undefined;
    var guild = exports.bot.guilds.get(serverId);
    guild.roles.forEach(function(value, key) {
      if (value.name == roleName) {
        role = value;
      }
    });
    return role;
  },
  commandAdd: function(information) {
    exports.commands.push({
      command: information.name,
      description: information.description,
      staffOnly: information.staffOnly,
      callback: information.callback,
    });
  },
  commandRemove: function(command) {
    for (i = 0; i < exports.commands.length; ++i) {
      if (exports.commands[i].command == command) {
        exports.commands.splice(i, 1);
        break;
      }
    }
  },
  processCommands: function(message) {
    var text = message.content;
    if (text.substr(0, 1) == exports.configObj.commandPrefix) {
      var messageWithoutPrefix = text.substr(1, text.length - 1);
      var msgSplit = messageWithoutPrefix.split(' ');
      if (msgSplit[0]) {
        for (i = 0; i < exports.commands.length; ++i) {
          if (exports.commands[i].command.toLowerCase() == msgSplit[0].toLowerCase()) {
            msgSplit.splice(0, 1);

            //checarPermissao
            if (exports.commands[i].staffOnly) {
              if (
                exports.checkMemberPermission(message.guild.id, message.member.id, 'ADMINISTRATOR')
              ) {
                exports.commands[i].callback(msgSplit ? msgSplit : '', message);
              } else {
                exports.sendMessage({
                  to: message.channel.id,
                  message: "You don't have the permissions to use this command.",
                  serverId: message.guild.id,
                });
              }
            } else {
              exports.commands[i].callback(msgSplit ? msgSplit : '', message);
            }

            break;
          }
        }
      }
    }
  },
  /******* Custom functions */
  processAttachments: function(message) {
    var attachments = message.attachments;
    var arr = attachments.array();
    for (var i = 0; i < arr.length; i++) {
      var obj = {
        serverId: message.guild.id,
        author: arr[i].message.author.username,
        message: message.content,
        authorAvatar: arr[i].message.author.avatarURL,
        authorID: arr[i].message.member.id,
        url: arr[i].url,
        type: 0,
        postTime: arr[i].message.createdAt,
        messageID: -1,
      };
      exports.sendProgress(obj);
      console.log('Postou attachment');
    }
  },
  processEmbeds: function(message) {
    var embeds = message.embeds;

    if (embeds.length == 0) {
      return;
    }

    for (var i = 0; i < embeds.length; i++) {
      var obj = {
        serverId: message.guild.id,
        author: embeds[i].message.author.username,
        message: message.content,
        authorAvatar: embeds[i].message.author.avatarURL,
        authorID: embeds[i].message.member.id,
        url: embeds[i].url,
        type: embeds[i].type,
        postTime: embeds[i].message.createdAt,
        messageID: -1,
      };

      exports.sendProgress(obj);
      console.log('Postou embed');
    }
  },
  sendProgress: function(obj) {
    var channel = exports.bot.guilds
      .get(obj.serverId)
      .channels.get(exports.configObj.outputChannel);
    var showcaseChannel = exports.bot.guilds
      .get(obj.serverId)
      .channels.get(exports.configObj.showcaseChannel);
    var arr = obj.message.split(' ');
    arr.splice(0, 1);

    var R = Math.floor(Math.random() * 256);
    var G = Math.floor(Math.random() * 256);
    var B = Math.floor(Math.random() * 256);

    var url = obj.url.toLowerCase();
    if (url.endsWith(".png") || url.endsWith(".gif") || url.endsWith(".jpeg") || url.endsWith(".jpg"))
    {
      var embed = {
        description: arr.join(' ') || 'Nenhuma descrição disponível.',
        color: B * 65536 + G * 256 + R,
        timestamp: obj.postTime.toISOString(),
        footer: {
          icon_url: exports.bot.user.avatarURL,
          text: 'Progresso',
        },
        fields: [
          {
            name: 'Member ID',
            value: obj.authorID,
            inline: true,
          },
        ],
        image: {
          url: obj.url,
        },
        author: {
          name: obj.author,
          icon_url: obj.authorAvatar,
        },
      };

      channel.send({ embed }).then(function (message) {
        message.react('✅').catch(console.error);
        message.react('❌').catch(console.error);
      }).catch(console.error);

      embed.fields = [];

      showcaseChannel.send({ embed }).catch(console.error);
    }
    else
    {
      var embed = {
        description: arr.join(' ') || 'Nenhuma descrição disponível.',
        color: B * 65536 + G * 256 + R,
        timestamp: obj.postTime.toISOString(),
        footer: {
          icon_url: exports.bot.user.avatarURL,
          text: 'Progresso',
        },
        fields: [
          {
            name: 'Member ID',
            value: obj.authorID,
            inline: true,
          },
        ],
        author: {
          name: obj.author,
          icon_url: obj.authorAvatar,
        },
      };

      channel.send({ embed }).then(function (message) {
        message.react('✅').catch(console.error);
        message.react('❌').catch(console.error);
        channel.send("Pré-visualização: " + obj.url).catch(console.error);
      }).catch(console.error);

      embed.fields = [];

      showcaseChannel.send({ embed }).then(function(message){
        showcaseChannel.send("Pré-visualização: " + obj.url).catch(console.error);
      }).catch(console.error);
    }
  },
  addDev: function(guildMember) {
    console.log('ID: ' + guildMember.id);
    var data = exports.getServerData(guildMember.guild.id);
    if (data == null) {
      data = {
        devs: [],
      };
    }

    var found = false;
    for (var i = 0; i < data.devs.length; i++) {
      if (data.devs[i].id == guildMember.id) {
        data.devs[i].time = Date.now();
        found = true;
        break;
      }
    }
    if (!found) {
      var obj = {
        id: guildMember.id,
        time: Date.now(),
      };
      data.devs.push(obj);
    }

    exports.memberAddRole(guildMember.guild.id, guildMember.id, {
      name: exports.configObj.devRole,
    });
    exports.writeServerData(guildMember.guild.id, data);
  },
  removeDev: function(guildMember) {
    var data = exports.getServerData(guildMember.guild.id);

    if (data == null) {
      return;
    }

    for (var i = 0; i < data.devs.length; i++) {
      if (data.devs[i].id == guildMember.id) {
        data.devs.splice(i, 1);
        break;
      }
    }
    exports.memberRemoveRole(guildMember.guild.id, guildMember.id, {
      name: exports.configObj.devRole,
    });
    exports.writeServerData(guildMember.guild.id, data);
  },
};
