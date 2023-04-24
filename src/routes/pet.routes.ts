import { PrismaGetPetByIdRepository } from "./../repositories/pets/get-pet-by-id/prisma-get-pet-by-id";
import { Router } from "express";
import { PrismaGetPetsRepository } from "../repositories/pets/get-pets/prisma-get-pets";
import { GetPetsController } from "../controllers/pets/get-pets/get-pets";
import { PrismaCreatePetsRepository } from "../repositories/pets/create-pet/prisma-create-pet";
import { CreatePetController } from "../controllers/pets/create-pets/create-pets";
import { PrismaGetUserByIdRepository } from "../repositories/users/get-user-by-id/prisma-get-user-by-id";
import { GetPetByIdController } from "../controllers/pets/get-pet-by-id/get-pet-by-id";

export const petRoutes = Router()
  .get("/all", async (req, res) => {
    const prismaGetPetsRepository = new PrismaGetPetsRepository();
    const getPetsController = new GetPetsController(prismaGetPetsRepository);

    const { body, statusCode } = await getPetsController.handle();

    res.status(statusCode).json(body);
  })
  .get("/:id", async (req, res) => {
    const prismaGetPetByIdRepository = new PrismaGetPetByIdRepository();
    const getPetByIdController = new GetPetByIdController(
      prismaGetPetByIdRepository
    );

    const { body, statusCode } = await getPetByIdController.handle({
      params: req.params,
    });

    res.status(statusCode).json(body);
  })
  .post("/create", async (req, res) => {
    const prismaCreatePetsRepository = new PrismaCreatePetsRepository();
    const prismaGetUserByIdRepository = new PrismaGetUserByIdRepository();
    const createPetController = new CreatePetController(
      prismaCreatePetsRepository,
      prismaGetUserByIdRepository
    );

    const { body, statusCode } = await createPetController.handle({
      body: req.body,
      headers: req.headers,
    });

    res.status(statusCode).json(body);
  });
