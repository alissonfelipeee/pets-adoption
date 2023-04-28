import { prisma } from "../../../database/prisma";
import { Pet } from "../../../models/Pet";
import { IGetPetByIdRepository } from "../../../controllers/pets/get-pet-by-id/protocols";

export class PrismaGetPetByIdRepository implements IGetPetByIdRepository {
  async getPetById(id: number): Promise<Pet> {
    const pet = (await prisma.pet.findUnique({
      where: {
        id,
      },
      include: {
        owner: true,
        adopter: true,
      },
    })) as Pet;

    return pet;
  }
}
