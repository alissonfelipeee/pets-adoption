import {
  IUpdateUserRepository,
  UpdateUserParams,
} from "../../controllers/update-user/protocols";
import { prisma } from "../../database/prisma";
import { User } from "../../models/user";

export class PrismaUpdateUserRepository implements IUpdateUserRepository {
  async updateUser(
    id: number,
    { firstName, lastName, password, phone }: UpdateUserParams
  ): Promise<User> {
    const user = await prisma.user.update({
      where: {
        id: +id,
      },
      data: {
        firstName,
        lastName,
        password,
        phone,
      },
    });

    return user;
  }
}
