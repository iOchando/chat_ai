"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const message_entity_1 = require("../entities/message.entity");
class MessageService {
    constructor() {
        this.createMessage = async (sender, content, user) => {
            try {
                const message = new message_entity_1.MessageEntity();
                message.sender = sender;
                message.content = content;
                message.user = user;
                const messageSaved = await message.save();
                return messageSaved;
            }
            catch (err) {
                throw new Error(`Failed to create message: ${err}`);
            }
        };
        this.getContext = async (user) => {
            return await message_entity_1.MessageEntity.find({
                where: { user: { id: user.id } },
                order: { createdAt: "DESC" },
                take: 6,
            });
        };
    }
}
exports.MessageService = MessageService;
