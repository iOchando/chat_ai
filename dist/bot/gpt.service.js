"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GptService = void 0;
const openai_1 = require("openai");
const user_service_1 = require("../modules/user/user.service");
const message_service_1 = require("../modules/message/message.service");
const openai = new openai_1.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
class GptService {
    constructor() {
        this.chatGPT = async (user, content) => {
            try {
                const context = await this.messageService.getContext(user);
                const configMessages = [
                    { role: "system", content: "Eres un asistente virtual en whatsapp, y te llamas Allice" },
                ];
                for (const message of context.reverse()) {
                    configMessages.push({ role: message.sender, content: message.content });
                }
                configMessages.push({ role: "user", content: content });
                const completion = await openai.chat.completions.create({
                    messages: configMessages,
                    model: "gpt-3.5-turbo",
                });
                return completion.choices[0].message.content;
            }
            catch (err) {
                throw new Error(`Failed chat gpt: ${err}`);
            }
        };
        this.userService = new user_service_1.UserService();
        this.messageService = new message_service_1.MessageService();
    }
}
exports.GptService = GptService;