const { Client } = require("whatsapp-web.js");
const fs = require("fs");
const qrcode = require("qrcode-terminal");

const SESSION_FILE_PATH = "./session.json";

const initCliente = () => {
  try {
    client = new Client();

    client.on("qr", (qr) => {
      qrcode.generate(qr, { small: true });
    });

    client.on("ready", () => {
      console.log("Client is ready!");
    });

    client.on("authenticated", (session) => {
      console.log("entro");
      fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
        if (err) {
          console.log(err);
        }
      });
    });

    client.on("auth_failure", (err) => {
      console.log("Autenticación fallida:", err);
    });

    client.initialize();
  } catch (error) {
    console.log(error);
  }
};

initCliente();
