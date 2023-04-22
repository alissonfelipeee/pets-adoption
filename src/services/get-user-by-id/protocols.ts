import { User } from "../../models/user";

export interface IGetUserByIdRepository {
  getUserById(id: number): Promise<User>;
}
