import { Schema, Document, model } from "mongoose";

export interface IMessage extends Document {
  sender: "system" | "user" | "assistant";
  content: string;
  user: Schema.Types.ObjectId;
}

const messageSchema: Schema = new Schema<IMessage>(
  {
    sender: {
      type: String,
      required: true,
      enum: ["system", "user", "assistant"],
    },
    content: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  },
);

const messageModel = model("messages", messageSchema);

export default messageModel;
