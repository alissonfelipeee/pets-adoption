import { prisma } from "../../../database/prisma";
import { Pet } from "../../../models/Pet";

export class PrismaGetPetByIdRepository {
  async getPetById(id: number): Promise<Pet> {
    const pet = (await prisma.pet.findUnique({
      where: {
        id,
      },
      include: {
        owner: true,
      },
    })) as Pet;

    return pet;
  }
}
