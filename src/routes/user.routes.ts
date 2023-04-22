import { Router, Request, Response } from "express";
import { PrismaGetUsersRepository } from "../repositories/users/get-users/prisma-get-users";
import { PrismaCreateUserRepository } from "../repositories/users/create-user/prisma-create-user";
import { PrismaUpdateUserRepository } from "../repositories/users/update-user/prisma-update-user";
import { PrismaDeleteUserRepository } from "../repositories/users/delete-user/prisma-delete-user";
import { PrismaGetUserByIdRepository } from "../repositories/users/get-user-by-id/prisma-get-user-by-id";
import { PrismaGetUserByEmailRepository } from "../repositories/users/get-user-by-email/prisma-get-user-by-email";
import { DeleteUserController } from "../controllers/users/delete-user/delete-user";
import { UpdateUserController } from "../controllers/users/update-user/update-user";
import { CreateUserController } from "../controllers/users/create-user/create-user";
import { GetUsersController } from "../controllers/users/get-users/get-users";

export const userRoutes = Router()
  .get("/", async (req: Request, res: Response) => {
    const prismaGetUsersRepository = new PrismaGetUsersRepository();
    const getUsersController = new GetUsersController(prismaGetUsersRepository);

    const { body, statusCode } = await getUsersController.handle();

    res.status(statusCode).json(body);
  })
  .post("/register", async (req: Request, res: Response) => {
    const prismaCreateUserRepository = new PrismaCreateUserRepository();
    const prismaGetUSerByEmailRepository =
      new PrismaGetUserByEmailRepository();
    const createUserController = new CreateUserController(
      prismaCreateUserRepository,
      prismaGetUSerByEmailRepository
    );

    const { body, statusCode } = await createUserController.handle({
      body: req.body,
    });

    res.status(statusCode).json(body);
  })

  .patch("/update/:id", async (req: Request, res: Response) => {
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

  .delete("/delete/:id", async (req: Request, res: Response) => {
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
