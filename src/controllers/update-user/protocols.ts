import { User } from "../../models/user";

export interface UpdateUserParams {
  firstName?: string;
  lastName?: string;
  password?: string;
  phone?: string;
}

export interface IUpdateUserRepository {
  updateUser(id: number, pamars: UpdateUserParams): Promise<User>;
}
