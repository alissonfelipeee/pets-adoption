import { prisma } from "../../../database/prisma";
import { Pet } from "../../../models/Pet";

export class PrismaGetPetsRepository {
  async getPets(): Promise<Pet[]> {
    const pets = await prisma.pet.findMany({
      include: {
        owner: true,
      },
    });

    return pets;
  }
}
