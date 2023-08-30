import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { UserEntity } from "../entities/user.entity";
import multer from "multer";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public getUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.userService.getUsers();
      res.send(users);
    } catch (error: any) {
      return res.status(500).send({ message: error.message });
    }
  };
}
