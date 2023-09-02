"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = __importDefault(require("./user.model"));
class UserService {
    constructor() {
        this.createUser = async (phoneId) => {
            try {
                // const userSaved = UserModel.create({ phoneId });
                const user = new user_model_1.default({
                    phoneId,
                });
                const userSaved = await user.save();
                return userSaved;
            }
            catch (err) {
                throw new Error(`Failed to create user: ${err}`);
            }
        };
        this.getUserByPhone = async (phoneId) => {
            try {
                const user = await user_model_1.default.findOne({ phoneId });
                return user;
            }
            catch (err) {
                throw new Error(`Failed to fetch user by phone: ${err}`);
            }
        };
        this.getUsers = async () => {
            try {
                const users = await user_model_1.default.find();
                return users;
            }
            catch (err) {
                throw new Error(`Failed to fetch users: ${err}`);
            }
        };
        this.updateUser = async (phoneId, body) => {
            try {
                const result = await user_model_1.default.updateOne({ phoneId }, body);
                if (result.modifiedCount === 0) {
                    throw new Error(`Failed to update user.`);
                }
                return result;
            }
            catch (err) {
                throw new Error(`Failed to update user: ${err}`);
            }
        };
    }
}
exports.UserService = UserService;
