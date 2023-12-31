import { OpenAI } from "openai";
import { UserService } from "../modules/user/user.service";
import { MessageService } from "../modules/message/message.service";
import { GptService } from "./gpt.service";
import { DisconnectReason, downloadMediaMessage } from "@whiskeysockets/baileys";
import { writeFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import fetch from "cross-fetch";
const sharp = require("sharp");
import Ffmpeg from "fluent-ffmpeg";

const ffmpeg = Ffmpeg();

export class CoreService {
  private userService: UserService;
  private messageService: MessageService;
  private gptService: GptService;

  constructor() {
    this.userService = new UserService();
    this.messageService = new MessageService();
    this.gptService = new GptService();
  }

  public coreProcess = async (socket: any, m: any, messageType: string) => {
    const phoneId = m.messages[0].key.remoteJid;
    try {
      let content;

      if (messageType === "audioMessage") {
        await socket.sendMessage(phoneId!, { text: "Procesando nota de voz..." });
        const buffer: any = await downloadMediaMessage(m.messages[0]!, "buffer", {});

        const uuid = uuidv4();
        await writeFile(`./uploads/${uuid}.ogg`, buffer);

        const file = fs.createReadStream(`./uploads/${uuid}.ogg`);

        content = await this.gptService.audioGPT(file);

        fs.unlinkSync(`./uploads/${uuid}.ogg`);
      } else if (messageType === "imageMessage") {
        if (m.messages[0].message.imageMessage.caption?.toLowerCase().startsWith("/sticker ")) {
          const buffer: any = await downloadMediaMessage(m.messages[0]!, "buffer", {});

          const uuid = uuidv4();

          await sharp(buffer).toFile(`./uploads/${uuid}.webp`, async (err: any, info: any) => {
            if (err) {
              return;
            } else {
              await socket.sendMessage(phoneId!, { sticker: fs.readFileSync(`./uploads/${uuid}.webp`) });
              fs.unlinkSync(`./uploads/${uuid}.webp`);
            }
          });
          return;
        }
      } else if (messageType === "videoMessage") {
        if (m.messages[0].message.videoMessage.caption?.toLowerCase().startsWith("/sticker ")) {
          const buffer: any = await downloadMediaMessage(m.messages[0]!, "buffer", {});

          const uuid = uuidv4();

          await writeFile(`./uploads/${uuid}.mp4`, buffer);

          const file = fs.createReadStream(`./uploads/${uuid}.mp4`);
          ffmpeg.input(file);
          ffmpeg.output("/uploads/output.webp");

          ffmpeg.toFormat("webp");

          ffmpeg
            .on("end", () => {
              console.log("Conversión exitosa.");
            })
            .on("error", (err) => {
              console.error("Error al convertir el video:", err);
            })
            .run();
          return;
        }
      } else {
        content = m.messages[0].message?.conversation || m.messages[0].message?.extendedTextMessage?.text;
      }

      if (!content || !phoneId) {
        return;
      }

      let user = await this.userService.getUserByPhone(phoneId);

      if (!user) {
        user = await this.userService.createUser(phoneId);
      }

      if (content.toLowerCase().startsWith("/imagen ")) {
        await socket.sendMessage(phoneId!, { text: "Creando imagen..." });
        const imageArray: any = await this.gptService.imageGPT(content);

        for (const image of imageArray) {
          const resp = await fetch(image.url);

          const arrayBuffer = await resp.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          await socket.sendMessage(phoneId!, { image: buffer });
        }
      } else {
        const response = await this.gptService.chatGPT(user, content);

        if (!response) {
          throw new Error(`Failed get response`);
        }

        await socket.sendMessage(phoneId!, { text: response });
        await this.messageService.createMessage("user", content, user);
        await this.messageService.createMessage("assistant", response!, user);
      }
    } catch (err) {
      console.log("ERROR");
      console.log(err);
      await socket.sendMessage(phoneId!, { text: "Oops, parece que tuve un problema al generar el mensaje." });
      return;
      // throw new Error(`Failed core service: ${err}`);
    }
  };
}
