import { IRemovePetAdopterRepository } from "../../../controllers/pets/remove-pet-adopter/protocols";
import { prisma } from "../../../database/prisma";
import { Pet } from "../../../models/Pet";

export class PrismaRemovePetAdopterRepository
  implements IRemovePetAdopterRepository
{
  async removePetAdopter(id: number): Promise<Pet> {
    const pet = await prisma.pet.update({
      where: {
        id,
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
