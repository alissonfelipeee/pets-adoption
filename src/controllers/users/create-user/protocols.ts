import { User } from "../../../models/User";

export interface CreateUserParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

export interface ICreateUserRepository {
  createUser(params: CreateUserParams): Promise<User>;
}
