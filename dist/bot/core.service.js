"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreService = void 0;
const user_service_1 = require("../modules/user/user.service");
const message_service_1 = require("../modules/message/message.service");
const gpt_service_1 = require("./gpt.service");
const baileys_1 = require("@whiskeysockets/baileys");
const promises_1 = require("fs/promises");
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const sharp_1 = __importDefault(require("sharp"));
const webp = require("webp-converter");
class CoreService {
    constructor() {
        this.coreProcess = async (socket, m, messageType) => {
            var _a, _b, _c, _d;
            try {
                let content;
                const phoneId = m.messages[0].key.remoteJid;
                if (messageType === "audioMessage") {
                    await socket.sendMessage(phoneId, { text: "Procesando nota de voz..." });
                    const buffer = await (0, baileys_1.downloadMediaMessage)(m.messages[0], "buffer", {});
                    const uuid = (0, uuid_1.v4)();
                    await (0, promises_1.writeFile)(`./uploads/${uuid}.ogg`, buffer);
                    const file = fs_1.default.createReadStream(`./uploads/${uuid}.ogg`);
                    content = await this.gptService.audioGPT(file);
                    fs_1.default.unlinkSync(`./uploads/${uuid}.ogg`);
                }
                else if (messageType === "imageMessage") {
                    if ((_a = m.messages[0].message.imageMessage.caption) === null || _a === void 0 ? void 0 : _a.toLowerCase().startsWith("/sticker")) {
                        const buffer = await (0, baileys_1.downloadMediaMessage)(m.messages[0], "buffer", {});
                        const uuid = (0, uuid_1.v4)();
                        await (0, sharp_1.default)(buffer).toFile(`./uploads/${uuid}.webp`, async (err, info) => {
                            if (err) {
                                return;
                            }
                            else {
                                await socket.sendMessage(phoneId, { sticker: fs_1.default.readFileSync(`./uploads/${uuid}.webp`) });
                                fs_1.default.unlinkSync(`./uploads/${uuid}.webp`);
                            }
                        });
                        return;
                    }
                }
                else {
                    content = ((_b = m.messages[0].message) === null || _b === void 0 ? void 0 : _b.conversation) || ((_d = (_c = m.messages[0].message) === null || _c === void 0 ? void 0 : _c.extendedTextMessage) === null || _d === void 0 ? void 0 : _d.text);
                }
                if (!content || !phoneId) {
                    return;
                }
                let user = await this.userService.getUserByPhone(phoneId);
                if (!user) {
                    user = await this.userService.createUser(phoneId);
                }
                const response = await this.gptService.chatGPT(user, content);
                if (!response) {
                    throw new Error(`Failed get response`);
                }
                if (response === "image-create") {
                    await socket.sendMessage(phoneId, { text: "Creando imagen..." });
                    const imageArray = await this.gptService.imageGPT(content);
                    const images = [];
                    for (const image of imageArray) {
                        const resp = await (0, cross_fetch_1.default)(image.url);
                        const arrayBuffer = await resp.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        images.push(buffer);
                    }
                    for (const image of images) {
                        await socket.sendMessage(phoneId, { image: image });
                    }
                    return;
                }
                else {
                    await this.messageService.createMessage("user", content, user);
                    await this.messageService.createMessage("assistant", response, user);
                    return await socket.sendMessage(phoneId, { text: response });
                }
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
