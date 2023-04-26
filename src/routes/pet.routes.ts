import { PrismaUpdatePetRepository } from "./../repositories/pets/update-pet/prisma-update-pet";
import { PrismaGetPetByIdRepository } from "./../repositories/pets/get-pet-by-id/prisma-get-pet-by-id";
import { Router } from "express";
import { PrismaGetPetsRepository } from "../repositories/pets/get-pets/prisma-get-pets";
import { GetPetsController } from "../controllers/pets/get-pets/get-pets";
import { PrismaCreatePetsRepository } from "../repositories/pets/create-pet/prisma-create-pet";
import { CreatePetController } from "../controllers/pets/create-pets/create-pets";
import { PrismaGetUserByIdRepository } from "../repositories/users/get-user-by-id/prisma-get-user-by-id";
import { GetPetByIdController } from "../controllers/pets/get-pet-by-id/get-pet-by-id";
import { UpdatePetController } from "../controllers/pets/update-pet/update-pet";
import { PrismaDeletePetRepository } from "../repositories/pets/delete-user/prisma-delete-user";
import { DeletePetController } from "../controllers/pets/delete-pet/delete-pet";
import { PrismaUpdatePetAvailabilityRepository } from "../repositories/pets/update-pet-availability/prisma-update-pet-availability";
import { UpdatePetAvailabilityController } from "../controllers/pets/update-pet-availability/update-pet-availability";
import { UpdatePetAdopterController } from "../controllers/pets/update-pet-adopter/update-pet-adopter";
import { PrismaUpdatePetAdopterRepository } from "../repositories/pets/update-pet-adopter/prisma-update-pet-adopter";

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
  })
  .patch("/update/:id", async (req, res) => {
    const prismaUpdatePetRepository = new PrismaUpdatePetRepository();
    const prismaGetPetByIdRepository = new PrismaGetPetByIdRepository();
    const updatePetController = new UpdatePetController(
      prismaUpdatePetRepository,
      prismaGetPetByIdRepository
    );

    const { body, statusCode } = await updatePetController.handle({
      body: req.body,
      params: req.params,
      headers: req.headers,
    });

    res.status(statusCode).json(body);
  })
  .delete("/delete/:id", async (req, res) => {
    const prismaGetPetByIdRepository = new PrismaGetPetByIdRepository();
    const prismaDeletePetRepository = new PrismaDeletePetRepository();
    const deletePetController = new DeletePetController(
      prismaDeletePetRepository,
      prismaGetPetByIdRepository
    );

    const { body, statusCode } = await deletePetController.handle({
      params: req.params,
      headers: req.headers,
    });

    res.status(statusCode).json(body);
  })
  .patch("/availability/:id", async (req, res) => {
    const prismaUpdatePetAvailabilityRepository =
      new PrismaUpdatePetAvailabilityRepository();
    const prismaGetPetByIdRepository = new PrismaGetPetByIdRepository();
    const updatePetAvailabilityController = new UpdatePetAvailabilityController(
      prismaUpdatePetAvailabilityRepository,
      prismaGetPetByIdRepository
    );

    const { body, statusCode } = await updatePetAvailabilityController.handle({
      params: req.params,
      headers: req.headers,
    });

    res.status(statusCode).json(body);
  })
  .patch("/adopt/:id", async (req, res) => {
    const prismaUpdatePetAdopterRepository =
      new PrismaUpdatePetAdopterRepository();
    const prismaGetUserByIdRepository = new PrismaGetUserByIdRepository();
    const prismaGetPetByIdRepository = new PrismaGetPetByIdRepository();
    const updatePetAdopterController = new UpdatePetAdopterController(
      prismaUpdatePetAdopterRepository,
      prismaGetUserByIdRepository,
      prismaGetPetByIdRepository
    );

    const { body, statusCode } = await updatePetAdopterController.handle({
      params: req.params,
      headers: req.headers,
    });

    res.status(statusCode).json(body);
  });
