import { User } from "../models/user";
import { DeleteUserController } from "./../controllers/delete-user/delete-user";
import { InMemoryGetUserByIdRepository, InMemoryUserRepository } from "./repositories/in-memory";

const userExample = {
  id: 1,
  firstName: "John",
  lastName: "Doe",
  email: "johndoe@gmail.com",
  password: "123456",
};

describe("Delete User", () => {
  it("should delete user", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const deleteUserController = new DeleteUserController(
      inMemoryUserRepository,
      inMemoryGetUserByIdRepository
    );

    const userCreated = await inMemoryUserRepository.createUser(userExample);

    const { body, statusCode } = await deleteUserController.handle({
      params: {
        id: userCreated.id,
      },
    });

    const { password, ...userWithoutPassword } = body as User;

    expect(body).toEqual(userWithoutPassword);
    expect(statusCode).toBe(200);
  });

  it("should return error because id params not exists", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const deleteUserController = new DeleteUserController(
      inMemoryUserRepository,
      inMemoryGetUserByIdRepository
    );

    const { body, statusCode } = await deleteUserController.handle({
      params: {},
    });

    expect(body).toEqual("Missing param: id");
    expect(statusCode).toBe(400);
  });

  it("should return error because user not exists", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const deleteUserController = new DeleteUserController(
      inMemoryUserRepository,
      inMemoryGetUserByIdRepository
    );

    const { body, statusCode } = await deleteUserController.handle({
      params: {
        id: 1,
      },
    });

    expect(body).toEqual("User not found");
    expect(statusCode).toBe(404);
  });

  it("should return 500 if something goes wrong", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const deleteUserController = new DeleteUserController(
      inMemoryUserRepository,
      inMemoryGetUserByIdRepository
    );

    const userCreated = await inMemoryUserRepository.createUser(userExample);

    jest.spyOn(inMemoryUserRepository, "delete").mockImplementationOnce(() => {
      throw new Error();
    });

    const { body, statusCode } = await deleteUserController.handle({
      params: {
        id: userCreated.id,
      },
    });

    expect(body).toBe("Internal Server Error");
    expect(statusCode).toBe(500);
  });
});
