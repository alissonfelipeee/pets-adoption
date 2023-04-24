import {
  IUpdatePetRepository,
  UpdatePetParams,
} from "../../../controllers/pets/update-pet/protocols";
import { prisma } from "../../../database/prisma";
import { Pet } from "../../../models/Pet";

export class PrismaUpdatePetRepository implements IUpdatePetRepository {
  async updatePet(
    id: number,
    { name, age, breed, available }: UpdatePetParams
  ): Promise<Pet> {
    const pet = await prisma.pet.update({
      where: {
        id: +id,
      },
      data: {
        name,
        age,
        breed,
        available,
      },
      include: {
        owner: true,
      }
    });

    return pet;
  }
}
