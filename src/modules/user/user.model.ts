import { Schema, Document, model } from "mongoose";
import { IMessage } from "../message/message.model";

export interface IUser extends Document {
  phoneId: string;
  messages: IMessage[];
}

const userSchema: Schema = new Schema(
  {
    phoneId: { type: String, required: true, unique: true },
    messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
  },
  {
    timestamps: true,
  },
);

export default model<IUser>("users", userSchema);
