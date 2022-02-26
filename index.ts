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
    else if (msg.content.toLowerCase().includes('chashtag')) {
        await getMessageResponse(msg, channel, MessageResponseType.CHASHTAG);
    }
});

client.login(process.env.TOKEN);

async function getMessageResponse(msg: Message, channel: any, messageType: MessageResponseType) {
    let message: string;
    let tenorSearchParameter: string;

    switch (messageType) {
        case MessageResponseType.JAVASCRIPT:
            message = await getRandomOpenAiText('say something ridiculous about javascript');
            tenorSearchParameter = 'amazing'
            break;
        case MessageResponseType.PHP:
            message = await getRandomOpenAiText('say something good about php');
            tenorSearchParameter = 'gross'
            break;
        case MessageResponseType.PYTHON:
            message = await getRandomOpenAiText('say something good about benjamin');
            tenorSearchParameter = '';
            break;
        case MessageResponseType.CHASHTAG:
            message = await getRandomOpenAiText('say something horrible about C#');
            tenorSearchParameter = 'horrible';
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
    const url = `https://g.tenor.com/v1/random?key=${process.env.TENOR}&q=${search}&limit=1`;
    let response = await axios.get(url);
    let gifData = response.data.results[0];

    //this gif id is very disgusting
    if(gifData.id == '21688678') {
        response = await axios.get(url);
        gifData = response.data.results[0];
    }
    return gifData;
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
    JAVASCRIPT = "JAVASCRIPT",
    CHASHTAG = "CHASHTAG"
} 
