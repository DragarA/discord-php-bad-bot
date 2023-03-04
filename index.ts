import { Message } from "discord.js";

const { Client, Intents, GatewayIntentBits } = require("discord.js");
const dotenv = require("dotenv");
const axios = require("axios");
const { Configuration, OpenAIApi } = require("openai");
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI,
});

const openai = new OpenAIApi(configuration);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (msg: Message) => {
  const channel = client.channels.cache.get(msg.channelId);

  if (msg.author.id === client.user.id) return;

  if (msg.content.toLowerCase().includes("php")) {
    await getMessageResponse(msg, channel, MessageResponseType.PHP);
  } else if (
    msg.content.toLowerCase().includes("js") ||
    msg.content.toLowerCase().includes("javascript")
  ) {
    await getMessageResponse(msg, channel, MessageResponseType.JAVASCRIPT);
  } else if (msg.content.toLowerCase().includes("python")) {
    await getMessageResponse(msg, channel, MessageResponseType.PYTHON);
  } else if (msg.content.toLowerCase().includes("chashtag")) {
    await getMessageResponse(msg, channel, MessageResponseType.CHASHTAG);
  } else if (msg.content.toLowerCase().includes("anime")) {
    await getMessageResponse(msg, channel, MessageResponseType.UWU);
  }
});

client.login(process.env.TOKEN);

async function getMessageResponse(
  msg: Message,
  channel: any,
  messageType: MessageResponseType
) {
  let message: string;
  let tenorSearchParameter: string;

  switch (messageType) {
    case MessageResponseType.JAVASCRIPT:
      message = await getRandomOpenAiText(
        "say something ridiculous about javascript"
      );
      tenorSearchParameter = "amazing";
      break;
    case MessageResponseType.PHP:
      message = await getRandomOpenAiText("say something good about php");
      tenorSearchParameter = "gross";
      break;
    case MessageResponseType.PYTHON:
      message = await getRandomOpenAiText("say something good about benjamin");
      tenorSearchParameter = "";
      break;
    case MessageResponseType.CHASHTAG:
      message = await getRandomOpenAiText("say something horrible about C#");
      tenorSearchParameter = "horrible";
      break;
    case MessageResponseType.UWU:
      message = await getRandomOpenAiText("say something anime");
      tenorSearchParameter = "anime";
      break;
    default:
      message = "Have a nice day!";
      tenorSearchParameter = "";
      break;
  }

  msg.reply(message);

  if (tenorSearchParameter !== "") {
    const gifData = await getRandomTenorGif(tenorSearchParameter);
    channel.send(gifData.url);
  }
}

async function getRandomTenorGif(search: string) {
  const url = `https://g.tenor.com/v1/random?key=${process.env.TENOR}&q=${search}&limit=1`;
  let response = await axios.get(url);
  let gifData = response.data.results[0];

  //this gif id is very disgusting
  if (gifData.id == "21688678") {
    response = await axios.get(url);
    gifData = response.data.results[0];
  }
  return gifData;
}

async function getRandomOpenAiText(prompt: string): Promise<string> {
  let responseSentence = "";
  try {
    const response = await openai.createCompletion("text-davinci-001", {
      prompt: prompt,
      max_tokens: 128,
    });
    responseSentence = response.data.choices[0].text;
  } catch (error) {
    console.log(error);
    responseSentence = `I don't know what to say, sorry :(`;
  }

  return responseSentence;
}

enum MessageResponseType {
  PHP = "PHP",
  PYTHON = "PYTHON",
  JAVASCRIPT = "JAVASCRIPT",
  CHASHTAG = "CHASHTAG",
  UWU = "ANIME",
}
