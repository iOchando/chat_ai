"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutesUser = void 0;
const user_controller_1 = require("../controllers/user.controller");
class RoutesUser {
    constructor(router) {
        this.controller = new user_controller_1.UserController();
        this.configureRoutes(router);
    }
    configureRoutes(router) {
        /**
         * Post track
         * @swagger
         * /get-users:
         *    get:
         *      tags:
         *        - User
         *      summary: Lista los username de los usuarios registrados.
         *      description: Responde solo el defixId de los usuarios.
         *      responses:
         *        '200':
         *          description: Responde un Array con la lista de usuarios.
         *        '400':
         *          description: Bad Request.
         *        '500':
         *          description: Bad Request.
         */
        router.get("/get-users", this.controller.getUsers);
    }
}
exports.RoutesUser = RoutesUser;
