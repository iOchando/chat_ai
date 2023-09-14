"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const app_1 = __importDefault(require("./app"));
const baileys_1 = require("@whiskeysockets/baileys");
const baileys_2 = __importDefault(require("@whiskeysockets/baileys"));
const path = require("path");
const core_service_1 = require("./bot/core.service");
const mongo_config_1 = __importDefault(require("./config/mongo.config"));
const pino_1 = __importDefault(require("pino"));
class Server {
    constructor() {
        this.app = app_1.default;
        this.port = Number(process.env.PORT) || 3000;
        this.coreService = new core_service_1.CoreService();
        // this.listen();
        this.connectToWhatsApp();
        this.connectMongoDB();
    }
    connectMongoDB() {
        (0, mongo_config_1.default)()
            .then(() => {
            console.log("Connection MongoDB ready");
        })
            .catch((error) => {
            console.error("Error to connect MongoDB ", error);
        });
    }
    async connectToWhatsApp() {
        let { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(path.resolve("./session"));
        let { version, isLatest } = await (0, baileys_1.fetchLatestBaileysVersion)();
        console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
        const logger = (0, pino_1.default)({
            level: "silent",
        });
        const sock = (0, baileys_2.default)({
            printQRInTerminal: true,
            auth: state,
            logger,
        });
        sock.ev.on("creds.update", saveCreds);
        sock.ev.on("connection.update", async (update) => {
            var _a, _b;
            const { connection, lastDisconnect } = update;
            if (connection === "close") {
                const shouldReconnect = ((_b = (_a = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _a === void 0 ? void 0 : _a.output) === null || _b === void 0 ? void 0 : _b.statusCode) !== baileys_1.DisconnectReason.loggedOut;
                console.log("Connection closed due to ", lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error, ", reconnecting ", shouldReconnect);
                if (shouldReconnect) {
                    this.connectToWhatsApp();
                }
            }
            else if (connection === "open") {
                console.log("Connection Whatsapp ready");
            }
            if (connection) {
                console.info(`Connection Status : ${connection}`);
            }
        });
        sock.ev.on("messages.upsert", async (m) => {
            console.log(JSON.stringify(m, undefined, 2));
            if (m.messages[0].message) {
                let messageType = Object.keys(m.messages[0].message)[0];
                if (messageType === "conversation" || messageType === "extendedTextMessage") {
                    messageType = "textMessage";
                }
                if (m.messages[0].key.fromMe &&
                    !m.messages[0].key.participant &&
                    (messageType === "textMessage" || messageType === "audioMessage" || messageType === "imageMessage")) {
                    this.coreService.coreProcess(sock, m, messageType);
                }
            }
        });
    }
    listen() {
        if (process.env.NODE_ENV === "production") {
            const credentials = {
                key: "text",
                cert: "text",
                ca: "text",
            };
            this.server = https.createServer(credentials, this.app);
        }
        else {
            this.server = http.createServer(this.app);
        }
        this.server.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}`);
        });
    }
}
new Server();
