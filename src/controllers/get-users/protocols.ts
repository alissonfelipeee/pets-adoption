import { User } from "../../models/User";

export interface IGetUsersRepository {
  getUsers(): Promise<User[]>;
}
