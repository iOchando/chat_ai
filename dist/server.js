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
const boom_1 = require("@hapi/boom");
const core_service_1 = require("./bot/core.service");
const mongo_config_1 = __importDefault(require("./config/mongo.config"));
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
            console.log("connection MongoDB ready");
        })
            .catch((error) => {
            console.error("Error to connect MongoDB ", error);
        });
    }
    async connectToWhatsApp() {
        let { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(path.resolve("./session"));
        let { version, isLatest } = await (0, baileys_1.fetchLatestBaileysVersion)();
        console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
        const sock = (0, baileys_2.default)({
            printQRInTerminal: true,
            auth: state,
        });
        sock.ev.on("creds.update", saveCreds);
        sock.ev.on("connection.update", async (update) => {
            var _a;
            if (update.connection == "open") {
                console.log("Connection ready!");
            }
            const { lastDisconnect, connection } = update;
            if (connection) {
                console.info(`Connection Status : ${connection}`);
            }
            if (connection == "close") {
                let reason = (_a = new boom_1.Boom(lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error)) === null || _a === void 0 ? void 0 : _a.output.statusCode;
                if (reason === baileys_1.DisconnectReason.badSession) {
                    console.log(`Bad Session File, Please Delete Session and Scan Again`);
                    sock.logout();
                }
                else if (reason === baileys_1.DisconnectReason.connectionClosed) {
                    console.log("Connection closed, reconnecting....");
                    this.connectToWhatsApp();
                }
                else if (reason === baileys_1.DisconnectReason.connectionLost) {
                    console.log("Connection Lost from Server, reconnecting...");
                    this.connectToWhatsApp();
                }
                else if (reason === baileys_1.DisconnectReason.connectionReplaced) {
                    console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");
                    sock.logout();
                }
                else if (reason === baileys_1.DisconnectReason.loggedOut) {
                    console.log(`Device Logged Out, Please Scan Again And Run.`);
                    process.exit();
                }
                else if (reason === baileys_1.DisconnectReason.restartRequired) {
                    console.log("Restart Required, Restarting...");
                    this.connectToWhatsApp();
                }
                else if (reason === baileys_1.DisconnectReason.timedOut) {
                    console.log("Connection TimedOut, Reconnecting...");
                    this.connectToWhatsApp();
                }
                else {
                    this.connectToWhatsApp();
                }
            }
        });
        sock.ev.on("messages.upsert", async (m) => {
            var _a, _b, _c;
            console.log(JSON.stringify(m, undefined, 2));
            if (!m.messages[0].key.fromMe && (((_a = m.messages[0].message) === null || _a === void 0 ? void 0 : _a.conversation) || ((_c = (_b = m.messages[0].message) === null || _b === void 0 ? void 0 : _b.extendedTextMessage) === null || _c === void 0 ? void 0 : _c.text))) {
                console.log("replying to", m.messages[0].key.remoteJid);
                this.coreService.coreProcess(sock, m);
                // await sock.sendMessage(m.messages[0].key.remoteJid!, { text: "Hola! Te esta respondiendo un BOT programado por Juan." });
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
