import { OpenAI } from "openai";
import { UserService } from "./user.service";
import { MessageService } from "./message.service";
import { MessageEntity } from "../entities/message.entity";
import { UserEntity } from "../entities/user.entity";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class GptService {
  private userService: UserService;
  private messageService: MessageService;

  constructor() {
    this.userService = new UserService();
    this.messageService = new MessageService();
  }

  public chatGPT = async (user: UserEntity, content: string) => {
    try {
      const context = await this.messageService.getContext(user);

      const configMessages: OpenAI.Chat.Completions.CreateChatCompletionRequestMessage[] = [
        { role: "system", content: "solo hablas como un malandro venezolano de petare, caracas" },
      ];

      for (const message of context.reverse()) {
        configMessages.push({ role: message.sender as "function" | "system" | "user" | "assistant", content: message.content });
      }

      configMessages.push({ role: "user", content: content });

      const completion = await openai.chat.completions.create({
        messages: configMessages,
        model: "gpt-3.5-turbo",
      });

      console.log(completion);

      return completion.choices[0].message.content;
    } catch (err) {
      throw new Error(`Failed chat gpt: ${err}`);
    }
  };
}
