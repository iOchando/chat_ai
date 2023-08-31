"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_entity_1 = require("../entities/user.entity");
class UserService {
    constructor() {
        this.createUser = async (phoneNumber) => {
            try {
                const user = new user_entity_1.UserEntity();
                user.phoneNumber = phoneNumber;
                const userSaved = await user.save();
                return userSaved;
            }
            catch (err) {
                throw new Error(`Failed to create user: ${err}`);
            }
        };
        this.getUserByPhone = async (phoneNumber) => {
            return await user_entity_1.UserEntity.findOneBy({ phoneNumber });
        };
        this.getUsers = async () => {
            return await user_entity_1.UserEntity.find();
        };
        this.updateUser = async (phoneNumber, body) => {
            const result = await user_entity_1.UserEntity.update({ phoneNumber }, body);
            if (result.affected === 0)
                throw new Error(`Failed to updated user.`);
            return result;
        };
    }
}
exports.UserService = UserService;
