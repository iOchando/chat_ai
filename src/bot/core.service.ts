import { OpenAI } from "openai";
import { UserService } from "../modules/user/user.service";
import { MessageService } from "../modules/message/message.service";
import { GptService } from "./gpt.service";
import { DisconnectReason, downloadMediaMessage } from "@whiskeysockets/baileys";
import { writeFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import fetch from "cross-fetch";

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
    try {
      let content;
      const phoneId = m.messages[0].key.remoteJid;

      if (messageType === "audioMessage") {
        await socket.sendMessage(phoneId!, { text: "Procesando nota de voz..." });
        const buffer: any = await downloadMediaMessage(m.messages[0]!, "buffer", {});

        const uuid = uuidv4();
        await writeFile(`./uploads/${uuid}.ogg`, buffer);

        const file = fs.createReadStream(`./uploads/${uuid}.ogg`);

        content = await this.gptService.audioGPT(file);

        fs.unlinkSync(`./uploads/${uuid}.ogg`);

        console.log(content);
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

      const response = await this.gptService.chatGPT(user, content);

      // const imageArray: any = await this.gptService.imageGPT(content);

      // for (const image of imageArray) {
      //   const resp = await fetch(image.url);

      //   const arrayBuffer = await resp.arrayBuffer();
      //   const buffer = Buffer.from(arrayBuffer);

      //   await socket.sendMessage(phoneId!, { image: buffer });
      // }

      // return;

      // console.log(response);

      if (!response) {
        throw new Error(`Failed get response`);
      }

      await this.messageService.createMessage("user", content, user);
      await this.messageService.createMessage("assistant", response!, user);

      return await socket.sendMessage(phoneId!, { text: response });
    } catch (err) {
      throw new Error(`Failed chat gpt: ${err}`);
    }
  };
}
