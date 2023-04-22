import { IDeleteUserRepository } from "../../controllers/delete-user/protocols";
import { prisma } from "../../database/prisma";
import { User } from "../../models/user";

export class PrismaDeleteUserRepository implements IDeleteUserRepository {
  async delete(id: number): Promise<User> {
    return await prisma.user.delete({
      where: {
        id: +id,
      },
    });
  }
}
