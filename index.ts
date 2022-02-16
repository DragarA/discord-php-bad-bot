import { Message } from "discord.js";

const { Client, Intents } = require('discord.js');
const dotenv = require('dotenv');
const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai')
dotenv.config();

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

const configuration = new Configuration({
    apiKey: process.env.OPENAI
});
const openai = new OpenAIApi(configuration);


client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

client.on("messageCreate", async (msg: Message) => {
    const channel = client.channels.cache.get(msg.channelId);

    if (msg.author.id === client.user.id) return;

    console.log(msg.content);

    if (msg.content.toLowerCase().includes('php')) {
        await getMessageResponse(msg, channel, MessageResponseType.PHP);
    }
    else if (msg.content.toLowerCase().includes('js') || msg.content.toLowerCase().includes('javascript')) {
        await getMessageResponse(msg, channel, MessageResponseType.JAVASCRIPT);
    }
    else if (msg.content.toLowerCase().includes('python')) {
        await getMessageResponse(msg, channel, MessageResponseType.PYTHON);
    }
});

client.login(process.env.TOKEN);

async function getMessageResponse(msg: Message, channel: any, messageType: MessageResponseType) {
    let message: string;
    let tenorSearchParameter: string;

    switch (messageType) {
        case MessageResponseType.JAVASCRIPT:
            message = await getRandomOpenAiText('say something nice about javascript');
            tenorSearchParameter = 'amazing'
            break;
        case MessageResponseType.PHP:
            message = await getRandomOpenAiText('say something bad about php');
            tenorSearchParameter = 'gross'
            break;
        case MessageResponseType.PYTHON:
            message = await getRandomOpenAiText('say something bad about benjamin');
            tenorSearchParameter = '';
            break;
        default:
            message = "Have a nice day!"
            tenorSearchParameter = '';
            break;
    }

    msg.reply(message);

    if (tenorSearchParameter !== '') {
        const gifData = await getRandomTenorGif(tenorSearchParameter);
        channel.send(gifData.url)
    }
}

async function getRandomTenorGif(search: string) {
    const url = `https://g.tenor.com/v1/random?key=${process.env.TENOR}&q=${search}`;
    const response = await axios.get(url);
    return response.data.results[0];
}

async function getRandomOpenAiText(prompt: string) {
    const response = await openai.createCompletion('text-davinci-001', {
        prompt: prompt,
        max_tokens: 128
    });
    return response.data.choices[0].text;
}

enum MessageResponseType {
    PHP = "PHP",
    PYTHON = "PYTHON",
    JAVASCRIPT = "JAVASCRIPT"
} 
