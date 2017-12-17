var jsonfile = require('jsonfile');
var path = require('path');
var fs = require('fs');
var exports = module.exports = {
  DATA: {
    DEVS: [],
    PROGRESS: [],
    dir: process.cwd()
  },
  addDev: function(guildMember){
    var obj = {
      id: guildMember.id,
      name: guildMember.user.username,
      avatar: guildMember.user.avatarURL,
      time: Date.now()
    };

    exports.DATA.DEVS.push(obj);
    exports.saveData();
  },
  removeDev: function(guildMember){
    for (var i = 0; i < exports.DATA.DEVS.length; i++)
    {
      if (exports.DATA.DEVS[i].name == guildMember.user.username)
      {
        exports.DATA.DEVS.splice(i,1);
        break;
      }
    }
    exports.saveData();
  },
  saveData: function(){
    var object = {};
    object["DEVS"] = exports.DATA.DEVS;
    object["PROGRESS"] = exports.DATA.PROGRESS;
    fs.writeFile(path.resolve(exports.DATA.dir, "content/data.json"), JSON.stringify(object, null, 4), (err) => {
      if (err) throw err;
    });
  },
  loadData: function(){

    var ex = fs.existsSync(path.resolve(exports.DATA.dir, './content/data.json'));
    if (ex) {
        var data = fs.readFileSync(path.resolve(exports.DATA.dir, './content/data.json'));
        var jsonP = JSON.parse(data);
        exports.DATA.DEVS = jsonP.DEVS;
        exports.DATA.PROGRESS = jsonP.PROGRESS;
    }

  },
  processAttachments: function(message){
    var attachments = message.attachments;
    var arr = attachments.array();
    for(var i = 0; i < arr.length; i++)
    {
      var obj = {
        author: arr[i].message.author.username,
        authorAvatar: arr[i].message.author.avatarURL,
        authorID: arr[i].message.member.id,
        url: arr[i].url,
        type: 0,
        postTime: arr[i].message.createdAt.getTime()
      };

      exports.DATA.PROGRESS.push(obj);
      exports.saveData();
      console.log("Postou attachment");
    }
  },
  processEmbeds: function(message){
    var embeds = message.embeds;

    if (embeds.length == 0)
    {
      return;
    }

    for(var i = 0; i < embeds.length; i++)
    {
      var obj = {
        author: embeds[i].message.author.username,
        authorAvatar: embeds[i].message.author.avatarURL,
        authorID: embeds[i].message.member.id,
        url: embeds[i].url,
        type: embeds[i].type,
        postTime: embeds[i].message.createdAt.getTime()
      };

      exports.DATA.PROGRESS.push(obj);
      exports.saveData();
      console.log("Postou embed");
    }
  },
  approveProgress: function(url){
    var p = null;
    var pid = -1;
    for(var i = 0; i < exports.DATA.PROGRESS.length; i++)
    {
      if (exports.DATA.PROGRESS[i].url == url)
      {
        p = exports.DATA.PROGRESS[i];
        pid = i;
        break;
      }
    }
    if (p == null){return;};

    var dev = null;
    for(var i = 0; i < exports.DATA.DEVS.length; i++)
    {
      if(p.author == exports.DATA.DEVS[i].name)
      {
        dev = exports.DATA.DEVS[i];
        break;
      }
    }
    if (dev)
    {
      dev.time = Date.now();
      exports.DATA.PROGRESS.splice(pid,1);
    }
    else
    {
      exports.addDev({
        id: p.authorID,
        user:{
          username: p.author,
          avatarURL: p.authorAvatar
        }
      });
      exports.DATA.PROGRESS.splice(pid,1);
    }
    exports.saveData();
  },
  recuseProgress: function(url){

    var p = null;
    var pid = -1;
    for(var i = 0; i < exports.DATA.PROGRESS.length; i++)
    {
      if (exports.DATA.PROGRESS[i].url == url)
      {
        p = exports.DATA.PROGRESS[i];
        pid = i;
        break;
      }
    }
    if (p == null){return;};
    exports.DATA.PROGRESS.splice(pid,1);
    exports.saveData();
  }
}
