import {
  CreatePetsParams,
  ICreatePetsRepository,
} from "../../../controllers/pets/create-pets/protocols";
import { prisma } from "../../../database/prisma";
import { Pet } from "../../../models/Pet";

export class PrismaCreatePetsRepository implements ICreatePetsRepository {
  async createPet({ name, age, breed, owner }: CreatePetsParams): Promise<Pet> {
    const pet = await prisma.pet.create({
      data: {
        name,
        age,
        breed,
        owner: {
          connect: {
            id: owner.id,
          },
        },
      },
      include: {
        owner: true,
      },
    });

    return pet;
  }
}
