import MessageModel, { IMessage } from "./message.model"; // Asegúrate de importar el modelo de mensaje correcto
import UserModel, { IUser } from "../user/user.model"; // Asegúrate de importar el modelo de usuario correcto

export class MessageService {
  public createMessage = async (sender: string, content: string, user: IUser) => {
    try {
      const message = new MessageModel({
        sender,
        content,
        user: user._id,
      });

      const messageSaved = await message.save();

      return messageSaved;
    } catch (err) {
      throw new Error(`Failed to create message: ${err}`);
    }
  };

  public getContext = async (user: IUser) => {
    try {
      const messages = await MessageModel.find({
        user: user._id,
      })
        .sort({ createdAt: "desc" })
        .limit(6);

      return messages;
    } catch (err) {
      throw new Error(`Failed to fetch user context: ${err}`);
    }
  };
}
