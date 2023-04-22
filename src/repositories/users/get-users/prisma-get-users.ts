import { IGetUsersRepository } from "../../../controllers/users/get-users/protocols";
import { prisma } from "../../../database/prisma";
import { User } from "../../../models/User";

export class PrismaGetUsersRepository implements IGetUsersRepository {
  async getUsers(): Promise<User[]> {
    const users = (await prisma.user.findMany()) as User[];
    return users;
  }
}
