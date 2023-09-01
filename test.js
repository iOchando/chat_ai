const {
  default: makeWASocket,
  delay,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  useMultiFileAuthState,
  useSingleFileAuthState,
  jidNormalizedUser,
} = require("@whiskeysockets/baileys");
const path = require("path");
const { Boom } = require("@hapi/boom");
// import { Boom } from "@hapi/boom";

async function connect() {
  let { state, saveCreds } = await useMultiFileAuthState(path.resolve("./session"));
  let { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
  const sock = makeWASocket({
    // can provide additional config here
    printQRInTerminal: true,
    auth: state,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    if (update.connection == "open" && sock.type == "legacy") {
      sock.user = {
        id: sock.state.legacy.user.id,
        jid: sock.state.legacy.user.id,
        name: sock.state.legacy.user.name,
      };
      console.log("ENTROOOOOOOOOOO!!!! *********************************");
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
        connect();
      } else if (reason === DisconnectReason.connectionLost) {
        console.log("Connection Lost from Server, reconnecting...");
        connect();
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");
        sock.logout();
      } else if (reason === DisconnectReason.loggedOut) {
        console.log(`Device Logged Out, Please Scan Again And Run.`);
        process.exit();
      } else if (reason === DisconnectReason.restartRequired) {
        console.log("Restart Required, Restarting...");
        connect();
      } else if (reason === DisconnectReason.timedOut) {
        console.log("Connection TimedOut, Reconnecting...");
        connect();
      } else sock.end(`Unknown DisconnectReason: ${reason}|${connection}`);
    }
  });

  sock.ev.on("messages.upsert", async (m) => {
    console.log(JSON.stringify(m, undefined, 2));

    console.log("replying to", m.messages[0].key.remoteJid);

    if (!m.messages[0].key.fromMe && (m.messages[0].message?.conversation || m.messages[0].message?.extendedTextMessage?.text)) {
      console.log("entro");
      await sock.sendMessage(m.messages[0].key.remoteJid, { text: "Hola! Te esta respondiendo un BOT programado por Juan." });
    }
    // sendMessage("Hola! Te esta respondiendo un BOT programado por Juan.", m.messages[0].key.remoteJid);
    // await sock.sendMessage(m.messages[0].key.remoteJid, { text: "Hola! Te esta respondiendo un BOT programado por Juan." });
  });

  const sendMessage = async (msg, jid) => {
    await sock.presenceSubscribe(jid);
    await delay(500);

    await sock.sendPresenceUpdate("composing", jid);
    await delay(2000);

    await sock.sendPresenceUpdate("paused", jid);

    await sock.sendMessage(jid, { text: "Hola! Te esta respondiendo un BOT programado por Juan." });
  };
}

connect();
