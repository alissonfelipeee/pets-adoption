import { Router } from 'express'
import { PrismaGetPetsRepository } from '../repositories/pets/get-pets/prisma-get-pets';
import { GetPetsController } from '../controllers/pets/get-pets/get-pets';

export const petRoutes = Router()
  .get('/', async (req, res) => {
    const prismaGetPetsRepository = new PrismaGetPetsRepository();
    const getPetsController = new GetPetsController(prismaGetPetsRepository);

    const { body, statusCode } = await getPetsController.handle();

    res.status(statusCode).json(body);
  });