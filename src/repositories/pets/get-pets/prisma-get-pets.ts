import { IGetPetsRepository } from "../../../controllers/pets/get-pets/protocols";
import { prisma } from "../../../database/prisma";
import { Pet } from "../../../models/Pet";

export class PrismaGetPetsRepository implements IGetPetsRepository {
  async getPets(): Promise<Pet[]> {
    const pets = await prisma.pet.findMany({
      include: {
        owner: true,
      },
    });

    return pets;
  }
}
