import "dotenv/config";
import * as http from "http";
import * as https from "https";
import App from "./app";
import { DisconnectReason, downloadMediaMessage, fetchLatestBaileysVersion, useMultiFileAuthState } from "@whiskeysockets/baileys";
import makeWASocket from "@whiskeysockets/baileys";
const path = require("path");
import { Boom } from "@hapi/boom";
import { CoreService } from "./bot/core.service";
import dbConnect from "./config/mongo.config";
import pino from "pino";

class Server {
  private app = App;
  private port: number = Number(process.env.PORT) || 3000;
  private server!: http.Server | https.Server;
  private coreService: CoreService;

  constructor() {
    this.coreService = new CoreService();
    // this.listen();
    this.connectToWhatsApp();
    this.connectMongoDB();
  }

  private connectMongoDB() {
    dbConnect()
      .then(() => {
        console.log("Connection MongoDB ready");
      })
      .catch((error) => {
        console.error("Error to connect MongoDB ", error);
      });
  }

  private async connectToWhatsApp() {
    let { state, saveCreds } = await useMultiFileAuthState(path.resolve("./session"));
    let { version, isLatest } = await fetchLatestBaileysVersion();

    console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);

    const logger = pino({
      level: "silent",
    });

    const sock = makeWASocket({
      printQRInTerminal: true,
      auth: state,
      logger,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === "close") {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log("Connection closed due to ", lastDisconnect?.error, ", reconnecting ", shouldReconnect);
        if (shouldReconnect) {
          this.connectToWhatsApp();
        }
      } else if (connection === "open") {
        console.log("Connection Whatsapp ready");
      }

      if (connection) {
        console.info(`Connection Status : ${connection}`);
      }
    });

    sock.ev.on("messages.upsert", async (m) => {
      console.log(JSON.stringify(m, undefined, 2));

      if (m.messages[0].message) {
        let messageType = Object.keys(m.messages[0].message!)[0];
        if (messageType === "conversation" || messageType === "extendedTextMessage") {
          messageType = "textMessage";
        }

        if (
          m.messages[0].key.fromMe &&
          !m.messages[0].key.participant &&
          (messageType === "textMessage" || messageType === "audioMessage" || messageType === "imageMessage")
        ) {
          this.coreService.coreProcess(sock, m, messageType);
        }
      }
    });
  }

  public listen() {
    if (process.env.NODE_ENV === "production") {
      const credentials = {
        key: "text",
        cert: "text",
        ca: "text",
      };
      this.server = https.createServer(credentials, this.app);
    } else {
      this.server = http.createServer(this.app);
    }
    this.server.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}`);
    });
  }
}

new Server();
