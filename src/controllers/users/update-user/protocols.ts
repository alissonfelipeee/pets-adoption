import { User } from "../../../models/User";

export interface UpdateUserParams {
  firstName?: string;
  lastName?: string;
  password?: string;
  phone?: string;
}

export interface IUpdateUserRepository {
  updateUser(id: number, params: UpdateUserParams): Promise<User>;
}
