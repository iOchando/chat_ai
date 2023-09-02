"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
async function dbConnect() {
    await (0, mongoose_1.connect)(process.env.MONGODB_URL);
}
exports.default = dbConnect;
