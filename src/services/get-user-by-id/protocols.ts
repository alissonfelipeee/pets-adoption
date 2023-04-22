import { User } from "../../models/User";

export interface IGetUserByIdRepository {
  getUserById(id: number): Promise<User>;
}
