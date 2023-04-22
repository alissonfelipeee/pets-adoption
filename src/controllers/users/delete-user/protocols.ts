import { User } from "../../../models/User";

export interface IDeleteUserRepository {
  delete(id: number): Promise<User>;
}
