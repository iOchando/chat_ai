import { UserEntity } from "../entities/user.entity";

export class UserService {
  public createUser = async (phoneNumber: string) => {
    try {
      const user = new UserEntity();

      user.phoneNumber = phoneNumber;

      const userSaved = await user.save();

      return userSaved;
    } catch (err) {
      throw new Error(`Failed to create user: ${err}`);
    }
  };

  public getUserByPhone = async (phoneNumber: string) => {
    return await UserEntity.findOneBy({ phoneNumber });
  };

  public getUsers = async () => {
    return await UserEntity.find();
  };

  public updateUser = async (phoneNumber: string, body: any) => {
    const result = await UserEntity.update({ phoneNumber }, body);

    if (result.affected === 0) throw new Error(`Failed to updated user.`);

    return result;
  };
}
