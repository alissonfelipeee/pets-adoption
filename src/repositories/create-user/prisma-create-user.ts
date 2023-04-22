import {
  CreateUserParams,
  ICreateUserRepository,
} from "../../controllers/create-user/protocols";
import { prisma } from "../../database/prisma";
import { User } from "../../models/user";

export class PrismaCreateUserRepository implements ICreateUserRepository {
  async createUser({
    firstName,
    lastName,
    email,
    password,
  }: CreateUserParams): Promise<User> {
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password,
      },
    }) as User;

    return user;
  }
}
