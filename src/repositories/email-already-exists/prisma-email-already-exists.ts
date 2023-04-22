import { prisma } from "../../database/prisma";
import { IEmailAlreadyExistsRepository } from "../../services/email-already-exists/protocols";

export class PrismaEmailAlreadyExistsRepository
  implements IEmailAlreadyExistsRepository
{
  async emailAlreadyExists(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    return user !== null;
  }
}
