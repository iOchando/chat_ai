"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    phoneId: { type: String, required: true, unique: true },
    messages: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Message" }],
}, {
    timestamps: true,
});
exports.default = (0, mongoose_1.model)("users", userSchema);
