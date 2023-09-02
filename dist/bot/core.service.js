"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreService = void 0;
const user_service_1 = require("../modules/user/user.service");
const message_service_1 = require("../modules/message/message.service");
const gpt_service_1 = require("./gpt.service");
class CoreService {
    constructor() {
        this.coreProcess = async (socket, m) => {
            var _a, _b, _c;
            try {
                const content = ((_a = m.messages[0].message) === null || _a === void 0 ? void 0 : _a.conversation) || ((_c = (_b = m.messages[0].message) === null || _b === void 0 ? void 0 : _b.extendedTextMessage) === null || _c === void 0 ? void 0 : _c.text);
                const phoneId = m.messages[0].key.remoteJid;
                if (!content || !phoneId) {
                    throw new Error(`Failed get content or phoneId`);
                }
                let user = await this.userService.getUserByPhone(phoneId);
                if (!user) {
                    user = await this.userService.createUser(phoneId);
                }
                const response = await this.gptService.chatGPT(user, content);
                console.log("content", content);
                console.log("response", response);
                await this.messageService.createMessage("user", content, user);
                await this.messageService.createMessage("assistant", response, user);
                await socket.sendMessage(phoneId, { text: response });
                return;
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
exports.CoreService = CoreService;
