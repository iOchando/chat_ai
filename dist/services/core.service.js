"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coreService = void 0;
const user_service_1 = require("./user.service");
const message_service_1 = require("./message.service");
const gpt_service_1 = require("./gpt.service");
class coreService {
    constructor() {
        this.coreProcess = async (phoneNumber, content) => {
            try {
                let user = await this.userService.getUserByPhone(phoneNumber);
                if (!user) {
                    user = await this.userService.createUser(phoneNumber);
                }
                const response = await this.gptService.chatGPT(user, content);
                await this.messageService.createMessage("user", content, user);
                // await this.messageService.createMessage("assistant", completion.choices[0], user);
                return response;
            }
            catch (err) {
                throw new Error(`Failed chat gpt: ${err}`);
            }
        };
        this.userService = new user_service_1.UserService();
        this.messageService = new message_service_1.MessageService();
        this.gptService = new gpt_service_1.GptService();
    }
}
exports.coreService = coreService;
