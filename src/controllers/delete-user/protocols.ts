import { User } from "../../models/user";

export interface IDeleteUserRepository {
  delete(id: number): Promise<User>;
}
