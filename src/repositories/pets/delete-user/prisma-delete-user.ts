import { prisma } from "../../../database/prisma";
import { Pet } from "../../../models/Pet";

export class PrismaDeletePetRepository {
  async delete(id: number): Promise<Pet> {
    return await prisma.pet.delete({
      where: {
        id: +id,
      },
      include: {
        owner: true,
      },
    });
  }
}
