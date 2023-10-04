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
const sharp = require("sharp");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const ffmpeg = (0, fluent_ffmpeg_1.default)();
class CoreService {
    constructor() {
        this.coreProcess = async (socket, m, messageType) => {
            var _a, _b, _c, _d, _e;
            const phoneId = m.messages[0].key.remoteJid;
            try {
                let content;
                console.log(messageType);
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
                        await sharp(buffer).toFile(`./uploads/${uuid}.webp`, async (err, info) => {
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
                else if (messageType === "videoMessage") {
                    if ((_b = m.messages[0].message.videoMessage.caption) === null || _b === void 0 ? void 0 : _b.toLowerCase().startsWith("/sticker")) {
                        const buffer = await (0, baileys_1.downloadMediaMessage)(m.messages[0], "buffer", {});
                        const uuid = (0, uuid_1.v4)();
                        console.log(uuid);
                        await (0, promises_1.writeFile)(`./uploads/${uuid}.mp4`, buffer);
                        const file = fs_1.default.createReadStream(`./uploads/${uuid}.mp4`);
                        ffmpeg.input(file);
                        ffmpeg.output("/uploads/output.webp");
                        ffmpeg.toFormat("webp");
                        ffmpeg
                            .on("end", () => {
                            console.log("Conversión exitosa.");
                        })
                            .on("error", (err) => {
                            console.error("Error al convertir el video:", err);
                        })
                            .run();
                        return;
                    }
                }
                else {
                    content = ((_c = m.messages[0].message) === null || _c === void 0 ? void 0 : _c.conversation) || ((_e = (_d = m.messages[0].message) === null || _d === void 0 ? void 0 : _d.extendedTextMessage) === null || _e === void 0 ? void 0 : _e.text);
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
                if (response.includes("image-create")) {
                    await socket.sendMessage(phoneId, { text: "Creando imagen..." });
                    const imageArray = await this.gptService.imageGPT(content);
                    for (const image of imageArray) {
                        const resp = await (0, cross_fetch_1.default)(image.url);
                        const arrayBuffer = await resp.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        await socket.sendMessage(phoneId, { image: buffer });
                    }
                    // await this.messageService.createMessage("assistant", "[imagen]", user);
                }
                else {
                    await socket.sendMessage(phoneId, { text: response });
                    await this.messageService.createMessage("user", content, user);
                    await this.messageService.createMessage("assistant", response, user);
                }
            }
            catch (err) {
                console.log("ERROR");
                console.log(err);
                await socket.sendMessage(phoneId, { text: "Oops, parece que tuve un problema al generar el mensaje." });
                return;
                // throw new Error(`Failed core service: ${err}`);
            }
        };
        this.userService = new user_service_1.UserService();
        this.messageService = new message_service_1.MessageService();
        this.gptService = new gpt_service_1.GptService();
    }
}
exports.CoreService = CoreService;
