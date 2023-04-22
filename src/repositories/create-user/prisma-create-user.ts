import {
  CreateUserParams,
  ICreateUserRepository,
} from "../../controllers/create-user/protocols";
import { prisma } from "../../database/prisma";
import { User } from "../../models/User";

export class PrismaCreateUserRepository implements ICreateUserRepository {
  async createUser({
    firstName,
    lastName,
    email,
    password,
    phone,
  }: CreateUserParams): Promise<User> {
    const user = (await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password,
        phone,
      },
    })) as User;

    return user;
  }
}
