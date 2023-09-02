import "dotenv/config";
import * as http from "http";
import * as https from "https";
import App from "./app";
import { DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState } from "@whiskeysockets/baileys";
import makeWASocket from "@whiskeysockets/baileys";
const path = require("path");
import { Boom } from "@hapi/boom";
import { CoreService } from "./bot/core.service";
import dbConnect from "./config/mongo.config";

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
        console.log("connection MongoDB ready");
      })
      .catch((error) => {
        console.error("Error to connect MongoDB ", error);
      });
  }

  private async connectToWhatsApp() {
    let { state, saveCreds } = await useMultiFileAuthState(path.resolve("./session"));
    let { version, isLatest } = await fetchLatestBaileysVersion();

    console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);

    const sock = makeWASocket({
      printQRInTerminal: true,
      auth: state,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      if (update.connection == "open") {
        console.log("Connection ready!");
      }

      const { lastDisconnect, connection } = update;

      if (connection) {
        console.info(`Connection Status : ${connection}`);
      }

      if (connection == "close") {
        let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
        if (reason === DisconnectReason.badSession) {
          console.log(`Bad Session File, Please Delete Session and Scan Again`);
          sock.logout();
        } else if (reason === DisconnectReason.connectionClosed) {
          console.log("Connection closed, reconnecting....");
          this.connectToWhatsApp();
        } else if (reason === DisconnectReason.connectionLost) {
          console.log("Connection Lost from Server, reconnecting...");
          this.connectToWhatsApp();
        } else if (reason === DisconnectReason.connectionReplaced) {
          console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");
          sock.logout();
        } else if (reason === DisconnectReason.loggedOut) {
          console.log(`Device Logged Out, Please Scan Again And Run.`);
          process.exit();
        } else if (reason === DisconnectReason.restartRequired) {
          console.log("Restart Required, Restarting...");
          this.connectToWhatsApp();
        } else if (reason === DisconnectReason.timedOut) {
          console.log("Connection TimedOut, Reconnecting...");
          this.connectToWhatsApp();
        } else {
          this.connectToWhatsApp();
        }
      }
    });

    sock.ev.on("messages.upsert", async (m) => {
      console.log(JSON.stringify(m, undefined, 2));
      if (!m.messages[0].key.fromMe && (m.messages[0].message?.conversation || m.messages[0].message?.extendedTextMessage?.text)) {
        console.log("replying to", m.messages[0].key.remoteJid);
        this.coreService.coreProcess(sock, m);
        // await sock.sendMessage(m.messages[0].key.remoteJid!, { text: "Hola! Te esta respondiendo un BOT programado por Juan." });
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
