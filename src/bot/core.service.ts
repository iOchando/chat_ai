import { OpenAI } from "openai";
import { UserService } from "../modules/user/user.service";
import { MessageService } from "../modules/message/message.service";
import { GptService } from "./gpt.service";

export class CoreService {
  private userService: UserService;
  private messageService: MessageService;
  private gptService: GptService;

  constructor() {
    this.userService = new UserService();
    this.messageService = new MessageService();
    this.gptService = new GptService();
  }

  public coreProcess = async (socket: any, m: any) => {
    try {
      const content = m.messages[0].message?.conversation || m.messages[0].message?.extendedTextMessage?.text;
      const phoneId = m.messages[0].key.remoteJid;

      if (!content || !phoneId) {
        throw new Error(`Failed get content or phoneId`);
      }

      let user = await this.userService.getUserByPhone(phoneId);

      if (!user) {
        user = await this.userService.createUser(phoneId);
      }

      const response = await this.gptService.chatGPT(user, content);

      await this.messageService.createMessage("user", content, user);
      await this.messageService.createMessage("assistant", response!, user);

      await socket.sendMessage(phoneId!, { text: response });

      return;
    } catch (err) {
      throw new Error(`Failed chat gpt: ${err}`);
    }
  };
}
