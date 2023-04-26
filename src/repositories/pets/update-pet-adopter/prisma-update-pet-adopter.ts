import { prisma } from "../../../database/prisma";
import { Pet } from "../../../models/Pet";
import { User } from "../../../models/User";

export class PrismaUpdatePetAdopterRepository {
  async updatePetAdopter(id: number, adopter: User): Promise<Pet> {
    const pet = await prisma.pet.update({
      where: {
        id: +id,
      },
      data: {
        adopter: {
          connect: {
            id: adopter.id,
          },
        },
        available: false,
      },
      include: {
        owner: true,
      },
    });

    return pet;
  }
}
