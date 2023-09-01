const { DisconnectReason, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const makeWASocket = require("@whiskeysockets/baileys").default;
// import { Boom } from "@hapi/boom";

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
  const sock = makeWASocket({
    // can provide additional config here
    printQRInTerminal: true,
    auth: state,
  });
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(qr);
    }

    if (connection === "close") {
      const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
      // console.log("connection closed due to ", lastDisconnect.error, ", reconnecting ", shouldReconnect);
      console.log("error");
      // reconnect if not logged out
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log("opened connection");
    }
  });
  // sock.ev.on("messages.upsert", async (m) => {
  //   console.log(JSON.stringify(m, undefined, 2));

  //   console.log("replying to", m.messages[0].key.remoteJid);
  //   await sock.sendMessage(m.messages[0].key.remoteJid, { text: "Hello there!" });
  // });
}
// run in main file
connectToWhatsApp();
