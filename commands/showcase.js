var utility = require('../my_modules/utility.js');

utility.commandAdd({
  name: 'showcase',
  description: 'Envia seu progresso no canal #showcase. Uso: !showcase progresso',
  staffOnly: false,
  callback: function(args, message) {
    if (utility.configObj.progressChannels.indexOf(message.channel.id) != -1) {
      var attachments = message.attachments;
      var embeds = message.embeds;

      if (attachments.first() != undefined) {
        utility.processAttachments(message);
      }
      setTimeout(utility.processEmbeds, 1500, message);
    }
  },
});
