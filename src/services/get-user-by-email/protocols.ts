import { User } from "../../models/User";

export interface IGetUserByEmailRepository {
  getUserByEmail(email: string): Promise<User | undefined>;
}