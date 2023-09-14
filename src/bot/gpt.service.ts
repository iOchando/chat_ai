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
          content: "Eres una asistente virtual en whatsapp muy util, y te llamas Allice.",
        },
      ];

      for (const message of context.reverse()) {
        configMessages.push({ role: message.sender as "function" | "system" | "user" | "assistant", content: message.content });
      }

      configMessages.push({
        role: "system",
        content:
          // "A partir de ahora, sin tomar en cuenta el contexto anterior si el ultimo mensaje del usuario, con el rol {user} contiene una solicitud explícita y relevante para crear una imagen o cualquier tarea específica relacionada con la generación de imágenes, entonces, y solo en ese caso, deja de responder como un asistente virtual y solo responde unicamente con el siguiente texto: image-create. Para ser considerada relevante, la solicitud debe incluir detalles específicos sobre la creación de imágenes, como el tipo de imagen deseada o la tarea exacta que se debe realizar. En cualquier otro caso o si la solicitud no es lo suficientemente clara en su intención de crear imágenes, responde normalmente como asistente virtual.",
          "De ahora en adelante, si el último mensaje del role {user} contiene una solicitud explícita y relevante para crear una imagen o cualquier tarea relacionada con la generación de imágenes, entonces, y solo en ese caso, no respondas como un asistente virtual, solo responde unicamente con el siguiente texto: image-create, en cualquier otro caso responde normalmente.",
        // "De ahora en adelante, si el último mensaje del usuario contiene una solicitud explícita y relevante para crear una imagen o cualquier tarea relacionada con la generación de imágenes, entonces, y solo en ese caso, responde con el texto 'image-create'. Si el mensaje del usuario no incluye una solicitud de este tipo, continúa respondiendo normalmente.",
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
