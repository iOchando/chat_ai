import "dotenv/config";
import * as http from "http";
import * as https from "https";
import App from "./app";
const fs = require("fs");
const { Client } = require("whatsapp-web.js");
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
    this.initClientWhatsApp();
  }

  private initClientWhatsApp() {
    this.withOutSession();
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
