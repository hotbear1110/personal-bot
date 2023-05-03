require('dotenv').config()
const { ChatClient } = require('@kararty/dank-twitch-irc');
const axios = require('axios');

const settings = {
    username: process.env.USERNAME,
    password: process.env.PASSWORD    
}

const client = new ChatClient(settings);

const whitelist = ['janz11', 'karl_mn', 'woyahcoo', 'rexisus1', 'botnextdoor', 'dany411'];
const afkcommands = ["$afk", "$gn", "$brb", "$work", "$shower", "$rafk", "$food"];
const rainbowlist = ["%23ff0000", "%23ff6600", "%23ffa500", "%23ffff00", "%23ccff33", "%2399ff33", "%23008000", "%2300cc66", "%2300ffcc", "%233a64fa", "%235f34ff", "%23913bfa", "%23cc00cc", "%23ff0066"];
const self = settings.username;
let isafk = false;
let rainbownumber = 0;
let rainbow = false;

client.on('PRIVMSG', async (msg) => {
    if (msg.senderUsername === self) {
        await selfCommand(msg);
    } else if (!isafk) {
        otherMessages(msg);
    }
  });


async function selfCommand(msg) {
    const input = msg.messageText.split(' ');
    const channel = msg.channelName;
    const sender = msg.senderUsername;

    if (afkcommands.includes(input[0].toLowerCase())) {
        isafk = true;
    } else if (sender === self && isafk) {
        isafk = false;
    }

    if (rainbow) {
        await axios.put(`https://api.twitch.tv/helix/chat/color?user_id=${process.env.UID}&color=${rainbowlist[rainbownumber]}`, {}, {
            headers: {
						'client-id': process.env.TWITCH_USER_CLIENTID,
						'Authorization': process.env.TWITCH_USER_AUTH
					}
                });
    
        rainbownumber++;
        
        if (rainbownumber === rainbowlist.length) {
            rainbownumber = 0;
        }
    }

    switch (input[0]) {
        case '!mefilesay': {
            if (!input[1]) { return; }

            const apicall = await axios.get(input[1]);
            apicall.data.split("\n").forEach(line => client.privmsg(input[2] ?? channel, line));
            return;
        }
        case '!rainbow': {
            if (!rainbow) {
                rainbow = true;
            } else {
                rainbow = false;
    
                client.privmsg(channel, "/color #913bfa")
                await axios.put(`https://api.twitch.tv/helix/chat/color?user_id=${process.env.UID}&color=%23913bfa`, {}, {
					headers: {
						'client-id': process.env.TWITCH_USER_CLIENTID,
						'Authorization': process.env.TWITCH_USER_AUTH
					}
                });
            }
        }
    }
}

const regex = new RegExp(`^(@?${self},?(\\b|\\s|$))+$`, 'i');
const replaceRegex = new RegExp(`${self}`, 'gi');

function otherMessages(msg) {
    const channel = msg.channelName;
    const sender = msg.senderUsername;
    const message = msg.messageText.replaceAll('󠀀', '');

    if (!whitelist.includes(sender)) { return; }

    if (regex.test(message)) {
        const response = message.replaceAll(replaceRegex, sender);

        client.privmsg(channel, response);
    }
}

client.on('ready', () => console.log('Successfully connected to chat'));

client.on('close', (error) => {
  if (error != null) {
    console.error('Client closed due to error', error);
  }
});

client.connect();
client.joinAll(['nymn', 'thotbear', '0ut3', 'atoxiv', 'nymn2', 'brian6932', 'fawcan'])