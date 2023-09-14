"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GptService = void 0;
const openai_1 = require("openai");
const user_service_1 = require("../modules/user/user.service");
const message_service_1 = require("../modules/message/message.service");
const openai = new openai_1.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
class GptService {
    constructor() {
        this.chatGPT = async (user, content) => {
            try {
                const context = await this.messageService.getContext(user);
                const configMessages = [
                    {
                        role: "system",
                        content: "Eres una asistente virtual en whatsapp muy util, y te llamas Allice.",
                    },
                ];
                for (const message of context.reverse()) {
                    configMessages.push({ role: message.sender, content: message.content });
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
            }
            catch (err) {
                throw new Error(`Failed chat gpt: ${err}`);
            }
        };
        this.audioGPT = async (file) => {
            try {
                const transcription = await openai.audio.transcriptions.create({
                    file: file,
                    model: "whisper-1",
                });
                return transcription.text;
            }
            catch (err) {
                throw new Error(`Failed audio gpt: ${err}`);
            }
        };
        this.imageGPT = async (prompt) => {
            try {
                console.log(prompt);
                const image = await openai.images.generate({ prompt, n: 2, size: "1024x1024" });
                console.log(image.data);
                return image.data;
            }
            catch (err) {
                throw new Error(`Failed image gpt: ${err}`);
            }
        };
        this.userService = new user_service_1.UserService();
        this.messageService = new message_service_1.MessageService();
    }
}
exports.GptService = GptService;
