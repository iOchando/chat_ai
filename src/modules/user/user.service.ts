import UserModel, { IUser } from "./user.model";

export class UserService {
  public createUser = async (phoneId: string) => {
    try {
      // const userSaved = UserModel.create({ phoneId });

      const user = new UserModel({
        phoneId,
      });

      const userSaved = await user.save();

      return userSaved;
    } catch (err) {
      throw new Error(`Failed to create user: ${err}`);
    }
  };

  public getUserByPhone = async (phoneId: string) => {
    try {
      const user = await UserModel.findOne({ phoneId });
      return user;
    } catch (err) {
      throw new Error(`Failed to fetch user by phone: ${err}`);
    }
  };

  public getUsers = async () => {
    try {
      const users = await UserModel.find();
      return users;
    } catch (err) {
      throw new Error(`Failed to fetch users: ${err}`);
    }
  };

  public updateUser = async (phoneId: string, body: any) => {
    try {
      const result = await UserModel.updateOne({ phoneId }, body);

      if (result.modifiedCount === 0) {
        throw new Error(`Failed to update user.`);
      }

      return result;
    } catch (err) {
      throw new Error(`Failed to update user: ${err}`);
    }
  };
}
