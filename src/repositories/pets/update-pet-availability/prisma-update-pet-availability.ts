import { prisma } from "../../../database/prisma";
import { Pet } from "../../../models/Pet";

export class PrismaUpdatePetAvailabilityRepository {
  async updatePetAvailability(id: number): Promise<Pet> {
    const pet = await prisma.pet.findUnique({
      where: {
        id: +id,
      },
      include: {
        owner: true,
      },
    });

    return await prisma.pet.update({
      where: {
        id: +id,
      },
      data: {
        available: !pet!.available,
      },
      include: {
        owner: true,
      },
    });
  }
}
