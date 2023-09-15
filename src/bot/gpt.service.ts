import { OpenAI } from "openai";
import { UserService } from "../modules/user/user.service";
import { MessageService } from "../modules/message/message.service";
import { IUser } from "../modules/user/user.model";
import fs from "fs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class GptService {
  private userService: UserService;
  private messageService: MessageService;

  constructor() {
    this.userService = new UserService();
    this.messageService = new MessageService();
  }

  public chatGPT = async (user: IUser, content: string) => {
    try {
      const context = await this.messageService.getContext(user);

      const configMessages: OpenAI.Chat.Completions.CreateChatCompletionRequestMessage[] = [
        {
          role: "system",
          content: "Eres una asistente virtual en whatsapp muy util, y te llamas Alice.",
        },
      ];

      for (const message of context.reverse()) {
        configMessages.push({ role: message.sender as "function" | "system" | "user" | "assistant", content: message.content });
      }

      configMessages.push({
        role: "system",
        content:
          "A continuacion se te va a sumistrar una {lista-de-instrucciones} las cuales debes seguir de manera estrictura, esas instrucciones te daran una serie de situaciones y como actuar si se presenta alguna de ellas.",
      });

      const instructions = fs.readFileSync("./promts/promt.txt", "utf8");

      console.log(instructions);

      configMessages.push({
        role: "system",
        content: "{lista-de-instrucciones}: \n" + instructions,
      });

      configMessages.push({ role: "user", content: content });

      const completion = await openai.chat.completions.create({
        messages: configMessages,
        model: "gpt-3.5-turbo",
      });

      return completion.choices[0].message.content;
    } catch (err) {
      throw new Error(`Failed chat gpt: ${err}`);
    }
  };

  public audioGPT = async (file: fs.ReadStream) => {
    try {
      const transcription = await openai.audio.transcriptions.create({
        file: file,
        model: "whisper-1",
      });
      return transcription.text;
    } catch (err) {
      throw new Error(`Failed audio gpt: ${err}`);
    }
  };

  public imageGPT = async (prompt: string) => {
    try {
      console.log(prompt);
      const image = await openai.images.generate({ prompt, n: 2, size: "1024x1024" });

      console.log(image.data);
      return image.data;
    } catch (err) {
      throw new Error(`Failed image gpt: ${err}`);
    }
  };
}
