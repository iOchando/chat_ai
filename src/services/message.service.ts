import { MessageEntity } from "../entities/message.entity";
import { UserEntity } from "../entities/user.entity";

export class MessageService {
  public createMessage = async (sender: string, content: string, user: UserEntity) => {
    try {
      const message = new MessageEntity();

      message.sender = sender;
      message.content = content;
      message.user = user;

      const messageSaved = await message.save();

      return messageSaved;
    } catch (err) {
      throw new Error(`Failed to create message: ${err}`);
    }
  };

  public getContext = async (user: UserEntity) => {
    return await MessageEntity.find({
      where: { user: { id: user.id } },
      order: { createdAt: "DESC" },
      take: 6,
    });
  };
}
