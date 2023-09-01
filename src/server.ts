import "dotenv/config";
import * as http from "http";
import * as https from "https";
import App from "./app";
const fs = require("fs");
const { Client } = require("whatsapp-web.js");
import makeWASocket, {
  DisconnectReason,
  SignalDataSet,
  makeCacheableSignalKeyStore,
  makeInMemoryStore,
  SignalDataTypeMap,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
// import { Client } from "whatsapp-web.js";

const qrcode = require("qrcode-terminal");

const SESSION_FILE_PATH = "./session.json";

class Server {
  private app = App;
  private port: number = Number(process.env.PORT) || 3000;
  private server!: http.Server | https.Server;
  private client!: any;

  constructor() {
    this.listen();
    this.connectToWhatsApp();
  }

  private async connectToWhatsApp() {
    const useStore = !process.argv.includes("--no-store");

    const logger = MAIN_LOGGER.child({});
    logger.level = "trace";

    const store = useStore ? makeInMemoryStore({ logger }) : undefined;

    const { state, saveCreds } = await useMultiFileAuthState("baileys_auth_info");
    const sock = makeWASocket({
      printQRInTerminal: true,
      auth: {
        creds: state.creds,
        /** caching makes the store faster to send/recv messages */
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
    });
    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === "close") {
        const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log("connection closed due to ", lastDisconnect.error, ", reconnecting ", shouldReconnect);
        // reconnect if not logged out
        if (shouldReconnect) {
          connectToWhatsApp();
        }
      } else if (connection === "open") {
        console.log("opened connection");
      }
    });
    sock.ev.on("messages.upsert", (m) => {
      console.log(JSON.stringify(m, undefined, 2));

      console.log("replying to", m.messages[0].key.remoteJid);
      sock.sendMessage(m.messages[0].key.remoteJid, { text: "Hello there!" });
    });
  }

  private async withOutSession() {
    console.log("entro");
    this.client = new Client();

    this.client.on("qr", (qr: string) => {
      qrcode.generate(qr, { small: true });
    });

    this.client.on("ready", () => {
      console.log("Client is ready!");
    });

    this.client.on("authenticated", (session: any) => {
      console.log("entro");
      fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err: any) => {
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
