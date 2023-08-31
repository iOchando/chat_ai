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
const fs = require("fs");
const { Client } = require("whatsapp-web.js");
// import { Client } from "whatsapp-web.js";
const qrcode = require("qrcode-terminal");
const SESSION_FILE_PATH = "./session.json";
class Server {
    constructor() {
        this.app = app_1.default;
        this.port = Number(process.env.PORT) || 3000;
        this.listen();
        this.initClientWhatsApp();
    }
    initClientWhatsApp() {
        this.withOutSession();
    }
    async withOutSession() {
        console.log("entro");
        this.client = new Client();
        this.client.on("qr", (qr) => {
            qrcode.generate(qr, { small: true });
        });
        this.client.on("ready", () => {
            console.log("Client is ready!");
        });
        this.client.on("authenticated", (session) => {
            console.log("entro");
            fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
                if (err) {
                    console.log(err);
                }
            });
        });
        // this.client.on("auth_failure", (err: any) => {
        //   console.log("Autenticación fallida:", err);
        // });
        // console.log(this.client);
        const asd = await this.client.initialize();
        console.log(asd);
        console.log("fin");
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
