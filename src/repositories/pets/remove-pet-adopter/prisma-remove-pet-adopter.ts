import { prisma } from "../../../database/prisma";
import { Pet } from "../../../models/Pet";

export class PrismaRemovePetAdopterRepository {
  async removePetAdopter(id: number): Promise<Pet> {
    const pet = await prisma.pet.update({
      where: {
        id: +id,
      },
      data: {
        adopterId: null,
        available: true,
      },
      include: {
        owner: true,
      },
    });

    return pet;
  }
}
