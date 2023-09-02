"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const message_model_1 = __importDefault(require("./message.model")); // Asegúrate de importar el modelo de mensaje correcto
class MessageService {
    constructor() {
        this.createMessage = async (sender, content, user) => {
            try {
                const message = new message_model_1.default({
                    sender,
                    content,
                    user: user._id,
                });
                const messageSaved = await message.save();
                return messageSaved;
            }
            catch (err) {
                throw new Error(`Failed to create message: ${err}`);
            }
        };
        this.getContext = async (user) => {
            try {
                const messages = await message_model_1.default.find({
                    user: user._id,
                })
                    .sort({ createdAt: "desc" })
                    .limit(6);
                return messages;
            }
            catch (err) {
                throw new Error(`Failed to fetch user context: ${err}`);
            }
        };
    }
}
exports.MessageService = MessageService;
