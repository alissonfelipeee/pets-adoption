import { prisma } from "../../../database/prisma";
import { Pet } from "../../../models/Pet";

export class PrismaUpdatePetRepository{
  async updatePet(
    id: number,
    { name, age, breed, available }: Pet
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
