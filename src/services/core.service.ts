import { OpenAI } from "openai";
import { UserService } from "./user.service";
import { MessageService } from "./message.service";
import { MessageEntity } from "../entities/message.entity";
import { GptService } from "./gpt.service";

export class coreService {
  private userService: UserService;
  private messageService: MessageService;
  private gptService: GptService;

  constructor() {
    this.userService = new UserService();
    this.messageService = new MessageService();
    this.gptService = new GptService();
  }

  public coreProcess = async (phoneNumber: string, content: string) => {
    try {
      let user = await this.userService.getUserByPhone(phoneNumber);

      if (!user) {
        user = await this.userService.createUser(phoneNumber);
      }

      const response = await this.gptService.chatGPT(user, content);

      await this.messageService.createMessage("user", content, user);
      // await this.messageService.createMessage("assistant", completion.choices[0], user);

      return response;
    } catch (err) {
      throw new Error(`Failed chat gpt: ${err}`);
    }
  };
}
