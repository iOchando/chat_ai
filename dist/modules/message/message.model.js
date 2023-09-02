"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    sender: {
        type: String,
        required: true,
        enum: ["system", "user", "assistant"],
    },
    content: { type: String, required: true },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
}, {
    timestamps: true,
});
const messageModel = (0, mongoose_1.model)("messages", messageSchema);
exports.default = messageModel;
