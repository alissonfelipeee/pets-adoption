import { User } from "../../models/user";

export interface UpdateUserParams {
  firstName?: string;
  lastName?: string;
  password?: string;
}

export interface IUpdateUserRepository {
  updateUser(id: number, pamars: UpdateUserParams): Promise<User>;
}
