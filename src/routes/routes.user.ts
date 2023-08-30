import { Express, Router } from "express";
import { UserController } from "../controllers/user.controller";
export class RoutesUser {
  private controller: UserController;

  constructor(router: Router) {
    this.controller = new UserController();
    this.configureRoutes(router);
  }

  private configureRoutes(router: Router) {
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
