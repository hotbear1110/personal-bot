import * as types from './@types/personal-bot';
import dotenv from "dotenv";
dotenv.config();
import { ChatClient, PrivmsgMessage } from "@kararty/dank-twitch-irc";
import axios, { AxiosResponse, AxiosError } from "axios";

const settings: types.jsonObject = {
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    ignoreUnhandledPromiseRejections: true 
}

const client: ChatClient = new ChatClient(settings);

const whitelist: string[] = ['janz11', 'karl_mn', 'woyahcoo', 'rexisus1', 'botnextdoor', 'dany411'];
const afkcommands: string[] = ["$afk", "$gn", "$brb", "$work", "$shower", "$rafk", "$food"];
const rainbowlist: string[] = ["ff0000", "ff6600", "ffa500", "ffff00", "ccff33", "99ff33", "008000", "00cc66", "00ffcc", "3a64fa", "5f34ff", "913bfa", "cc00cc", "ff0066"];
const self: string = settings.username!;
let isafk: boolean = false;
let rainbow: boolean = false;
let rainbownumber: number = 0;

client.on('PRIVMSG', async (msg: PrivmsgMessage) => {
    if (msg.senderUsername === self) {
        await selfCommand(msg);
    } else if (!isafk) {
        otherMessages(msg);
    }
  });


async function selfCommand(msg: PrivmsgMessage) {
    const input: string[] = msg.messageText.split(' ');
    const channel: string = msg.channelName;
    const sender: string = msg.senderUsername;

    if (afkcommands.includes(input[0].toLowerCase())) {
        isafk = true;
    } else if (sender === self && isafk) {
        isafk = false;
    }

    if (rainbow) {
        try {
            await axios.put(`https://api.twitch.tv/helix/chat/color?user_id=${process.env.UID}&color=%23${rainbowlist[rainbownumber]}`, {}, {
                headers: {
                            'client-id': process.env.TWITCH_USER_CLIENTID,
                            'Authorization': process.env.TWITCH_USER_AUTH
                        }
                    });
        } catch (err: unknown) {
            console.log(err);
        }
    
        rainbownumber++;
        
        if (rainbownumber === rainbowlist.length) {
            rainbownumber = 0;
        }
    }

    switch (input[0]) {
        case '!mefilesay': {
            if (!input[1]) { return; }

            let apicall: AxiosResponse;
            try {
                apicall = await axios.get(input[1]);
            } catch (err: unknown) {
                console.log(err);

                client.privmsg(input[2] ?? channel, 'FeelsDankMan Something went wrong!');
                return;
            }

            apicall.data.split("\n").forEach((line: string) => client.privmsg(input[2] ?? channel, line.replaceAll(/[\n\r]/g, ' ')));
            return;
        }
        case '!rainbow': {
            if (!rainbow) {
                rainbow = true;
            } else {
                rainbow = false;
    
                try {
                    await axios.put(`https://api.twitch.tv/helix/chat/color?user_id=${process.env.UID}&color=%23913bfa`, {}, {
                        headers: {
                            'client-id': process.env.TWITCH_USER_CLIENTID,
                            'Authorization': process.env.TWITCH_USER_AUTH
                        }
                    });
                } catch (err: unknown) {
                    console.log(err);

                    client.privmsg(input[2] ?? channel, 'FeelsDankMan Something went wrong!');
                    return;
                }
            }
        }
    }
}

const regex: RegExp = new RegExp(`^(@?${self},?(\\b|\\s|$))+$`, 'i');
const replaceRegex: RegExp = new RegExp(`${self}`, 'gi');

function otherMessages(msg: PrivmsgMessage) {
    const channel: string = msg.channelName;
    const sender: string = msg.senderUsername;
    const message: string = msg.messageText.replaceAll('\u{e0000}', '');

    if (!whitelist.includes(sender)) { return; }

    if (regex.test(message)) {
        const response: string = message.replaceAll(replaceRegex, sender);

        client.privmsg(channel, response);
    }
}

client.on('ready', () => console.log('Successfully connected to chat'));

client.on('close', (err: Error | undefined) => {
  if (err != null) {
    console.error('Client closed due to error', err);
  }
});

client.connect();
client.joinAll(['nymn', 'thotbear', '0ut3', 'atoxiv', 'nymn2', 'brin____', 'fawcan']);