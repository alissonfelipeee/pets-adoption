import { Router, Request, Response } from "express";
import { PrismaGetUsersRepository } from "../repositories/get-users/prisma-get-users";
import { PrismaCreateUserRepository } from "../repositories/create-user/prisma-create-user";
import { PrismaUpdateUserRepository } from "../repositories/update-user/prisma-update-user";
import { PrismaDeleteUserRepository } from "../repositories/delete-user/prisma-delete-user";
import { PrismaGetUserByIdRepository } from "../repositories/get-user-by-id/prisma-get-user-by-id";
import { PrismaEmailAlreadyExistsRepository } from "../repositories/email-already-exists/prisma-email-already-exists";
import { DeleteUserController } from "../controllers/delete-user/delete-user";
import { UpdateUserController } from "../controllers/update-user/update-user";
import { CreateUserController } from "../controllers/create-user/create-user";
import { GetUsersController } from "../controllers/get-users/get-users";

export const router = Router()
  .get("/users", async (req: Request, res: Response) => {
    const prismaGetUsersRepository = new PrismaGetUsersRepository();
    const getUsersController = new GetUsersController(prismaGetUsersRepository);

    const { body, statusCode } = await getUsersController.handle();

    res.status(statusCode).json(body);
  })
  .post("/users", async (req: Request, res: Response) => {
    const prismaCreateUserRepository = new PrismaCreateUserRepository();
    const prismaEmailAlreadyExistsRepository =
      new PrismaEmailAlreadyExistsRepository();
    const createUserController = new CreateUserController(
      prismaCreateUserRepository,
      prismaEmailAlreadyExistsRepository
    );

    const { body, statusCode } = await createUserController.handle({
      body: req.body,
    });

    res.status(statusCode).json(body);
  })

  .patch("/users/:id", async (req: Request, res: Response) => {
    const prismaUpdateUserRepository = new PrismaUpdateUserRepository();
    const updateUserController = new UpdateUserController(
      prismaUpdateUserRepository
    );

    const { body, statusCode } = await updateUserController.handle({
      body: req.body,
      params: req.params,
    });

    res.status(statusCode).json(body);
  })

  .delete("/users/:id", async (req: Request, res: Response) => {
    const prismaDeleteUserRepository = new PrismaDeleteUserRepository();
    const prismaGetUserByIdRepository = new PrismaGetUserByIdRepository();
    const deleteUserController = new DeleteUserController(
      prismaDeleteUserRepository,
      prismaGetUserByIdRepository
    );

    const { body, statusCode } = await deleteUserController.handle({
      params: req.params,
    });

    res.status(statusCode).json(body);
  });
