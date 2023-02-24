//  This code is a chatbot that uses the OpenAI API to generate responses.
// When receiving a '/start' message, the bot activates and sends a message with this text,
// and then when other messages are received, it uses the OpenAI API to generate a response.

const dotenv = require('dotenv').config();

const telegramAPI = require('node-telegram-bot-api');
const token = process.env.KEY_BOT;
const settings = require('./settings');
const  KeyvFile= require ('keyv-file').KeyvFile;
const bot = new telegramAPI(token,{polling: true});
const  fs = require('fs');
const ChatGPTClient =require('./src/ChatGPTClient.js') ;
const arg = process.argv.find((arg) => arg.startsWith('--settings'));
let path;
if (arg) {
    path = arg.split('=')[1];
} else {
    path = './settings.js';
}

if (settings.storageFilePath && !settings.cacheOptions.store) {
    // make the directory and file if they don't exist
    const dir = settings.storageFilePath.split('/').slice(0, -1).join('/');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(settings.storageFilePath)) {
        fs.writeFileSync(settings.storageFilePath, '');
    }

    settings.cacheOptions.store = new KeyvFile({ filename: settings.storageFilePath });
}

const chatGptClient = new ChatGPTClient(settings.openaiApiKey, settings.chatGptClient, settings.cacheOptions);


const myText = "Hello, tell us about your main features in 5 points.\n" +
    "Answer my questions like a pro.\n" ;

(async () => {
    
    try {
        // Catching a message from the chat
        bot.on('message', async msg => {
            const text = msg.text;
            const chatId = msg.chat.id;
           
            // // Process the "/start" command and send brief information to the chat
            if (text === '/start') {
                myMessage = myText;
                await bot.sendMessage(chatId, `This chat-bot is a bot that uses the OpenAI API to create responses. 
Upon receipt of the '/start' message, the bot is activated and sends  a message with the given text, and then upon receipt of other messages - uses the OpenAI API to generate the response. You can communicate with the bot in almost any widely used language. GPT-3:`)
            } else { myMessage = text }
            // Pass model settings to OpenAI
            try {
                
                result = await chatGptClient.sendMessage(myMessage, { });
                console.log("result",result);
            } catch (e) {
                error = e;
            }
        
          
            
            await bot.sendMessage(chatId, result.response);

            // const completion = await openai.createCompletion({
            //     model: 'text-davinci-003',
            //     prompt: myMessage,
            //     temperature: 1.0,
            //     max_tokens: 1024,
            //     top_p: 1.0,
            //     frequency_penalty:0.5,
            //     presence_penalty: 0.6,
            //     stop: ["\n+"],
            // })
            // send the generated response to the chat
            //await bot.sendMessage(chatId, completion.data.choices[0].text);
            
        })
    // If there are errors, print them to the console
    } catch (error) {
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
            await bot.sendMessage(chatId, "You exceeded your current quota, please check your plan and billing details.");
        } else {
            console.log(error.message);
        }
    }
}) ();
