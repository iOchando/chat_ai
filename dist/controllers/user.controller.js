"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
class UserController {
    constructor() {
        this.getUsers = async (req, res) => {
            try {
                const users = await this.userService.getUsers();
                res.send(users);
            }
            catch (error) {
                return res.status(500).send({ message: error.message });
            }
        };
        this.userService = new user_service_1.UserService();
    }
}
exports.UserController = UserController;
