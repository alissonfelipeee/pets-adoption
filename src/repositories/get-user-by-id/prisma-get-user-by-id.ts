import { prisma } from "../../database/prisma";
import { User } from "../../models/user";
import { IGetUserByIdRepository } from "../../services/get-user-by-id/protocols";

export class PrismaGetUserByIdRepository implements IGetUserByIdRepository {
  async getUserById(id: number): Promise<User> {
    const user = (await prisma.user.findUnique({
      where: {
        id,
      },
    })) as User;

    return user;
  }
}
