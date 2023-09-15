"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GptService = void 0;
const openai_1 = require("openai");
const user_service_1 = require("../modules/user/user.service");
const message_service_1 = require("../modules/message/message.service");
const fs_1 = __importDefault(require("fs"));
const openai = new openai_1.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
class GptService {
    constructor() {
        this.chatGPT = async (user, content) => {
            try {
                const context = await this.messageService.getContext(user);
                const configMessages = [
                    {
                        role: "system",
                        content: "Eres una asistente virtual en whatsapp muy util, y te llamas Alice.",
                    },
                ];
                for (const message of context.reverse()) {
                    configMessages.push({ role: message.sender, content: message.content });
                }
                configMessages.push({
                    role: "system",
                    content: "A continuacion se te va a sumistrar una {lista-de-instrucciones} las cuales debes seguir de manera estricta, esas instrucciones te daran una serie de situaciones y como actuar si se presenta alguna de ellas.",
                });
                const instructions = fs_1.default.readFileSync("./promts/promt.txt", "utf8");
                configMessages.push({
                    role: "system",
                    content: "{lista-de-instrucciones}: \n" + instructions,
                });
                configMessages.push({ role: "user", content: content });
                const completion = await openai.chat.completions.create({
                    messages: configMessages,
                    model: "gpt-3.5-turbo",
                });
                return completion.choices[0].message.content;
            }
            catch (err) {
                return false;
                // throw new Error(`Failed chat gpt: ${err}`);
            }
        };
        this.audioGPT = async (file) => {
            try {
                const transcription = await openai.audio.transcriptions.create({
                    file: file,
                    model: "whisper-1",
                });
                return transcription.text;
            }
            catch (err) {
                return false;
                // throw new Error(`Failed audio gpt: ${err}`);
            }
        };
        this.imageGPT = async (prompt) => {
            try {
                console.log(prompt);
                const image = await openai.images.generate({ prompt, n: 2, size: "1024x1024" });
                console.log(image.data);
                return image.data;
            }
            catch (err) {
                return [];
                // throw new Error(`Failed image gpt: ${err}`);
            }
        };
        this.userService = new user_service_1.UserService();
        this.messageService = new message_service_1.MessageService();
    }
}
exports.GptService = GptService;
