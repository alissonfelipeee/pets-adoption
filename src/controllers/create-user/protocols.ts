import { User } from "../../models/user";

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
