import { IUpdatePetAdopterRepository } from "../../../controllers/pets/update-pet-adopter/protocolts";
import { prisma } from "../../../database/prisma";
import { Pet } from "../../../models/Pet";
import { User } from "../../../models/User";

export class PrismaUpdatePetAdopterRepository
  implements IUpdatePetAdopterRepository
{
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
        adopter: true,
      },
    });

    return pet;
  }
}
