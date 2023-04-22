import { User } from "../models/user";
import { CreateUserController } from "./../controllers/create-user/create-user";
import {
  InMemoryEmailAlreadyExistsRepository,
  InMemoryUserRepository,
} from "./repositories/in-memory";

const user = {
  firstName: "John",
  lastName: "Doe",
  email: "johndoe@gmail.com",
  password: "123456",
};

const userWithoutFirstName = {
  lastName: "Doe",
  email: "johndoe@gmail.com",
  password: "123456",
};

describe("Create user", () => {
  it("should create a user", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryEmailAlreadyExistsRepository =
      new InMemoryEmailAlreadyExistsRepository();
    const createUserController = new CreateUserController(
      inMemoryUserRepository,
      inMemoryEmailAlreadyExistsRepository
    );

    const { body, statusCode } = await createUserController.handle({
      body: user,
    });

    const { password, ...userWithoutPassword } = body as User;

    expect(body).toEqual({
      ...userWithoutPassword,
      id: 1,
    });
    expect(statusCode).toBe(201);
  });

  it("shoul not be able create user because not exists a body", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryEmailAlreadyExistsRepository =
      new InMemoryEmailAlreadyExistsRepository();
    const createUserController = new CreateUserController(
      inMemoryUserRepository,
      inMemoryEmailAlreadyExistsRepository
    );

    const { body, statusCode } = await createUserController.handle({});

    expect(body).toEqual("Bad Request - Missing body");
    expect(statusCode).toBe(400);
  });

  it("should not be able to create a user because firstName is missing", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryEmailAlreadyExistsRepository =
      new InMemoryEmailAlreadyExistsRepository();
    const createUserController = new CreateUserController(
      inMemoryUserRepository,
      inMemoryEmailAlreadyExistsRepository
    );

    const { body, statusCode } = await createUserController.handle({
      body: userWithoutFirstName as User,
    });

    expect(body).toEqual("Bad Request - Missing field: firstName");
    expect(statusCode).toBe(400);
  });

  it("should not be able to create a user because firstName is empty", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryEmailAlreadyExistsRepository =
      new InMemoryEmailAlreadyExistsRepository();
    const createUserController = new CreateUserController(
      inMemoryUserRepository,
      inMemoryEmailAlreadyExistsRepository
    );

    const { body, statusCode } = await createUserController.handle({
      body: { ...user, firstName: "" },
    });

    expect(body).toEqual("Bad Request - Invalid firstName");
    expect(statusCode).toBe(400);
  });

  it("should not be able to create a user because email is invalid", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryEmailAlreadyExistsRepository =
      new InMemoryEmailAlreadyExistsRepository();
    const createUserController = new CreateUserController(
      inMemoryUserRepository,
      inMemoryEmailAlreadyExistsRepository
    );

    const { body, statusCode } = await createUserController.handle({
      body: { ...user, email: "johndoe" },
    });

    expect(body).toEqual("Bad Request - Invalid email");
    expect(statusCode).toBe(400);
  });

  it("should not be able to create a user because email already exists", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryEmailAlreadyExistsRepository =
      new InMemoryEmailAlreadyExistsRepository();
    const createUserController = new CreateUserController(
      inMemoryUserRepository,
      inMemoryEmailAlreadyExistsRepository
    );

    await createUserController.handle({
      body: user,
    });

    const { body, statusCode } = await createUserController.handle({
      body: user,
    });

    expect(body).toEqual("Bad Request - Email already exists");
    expect(statusCode).toBe(400);
  });

  it("should return 500 if something goes wrong", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryEmailAlreadyExistsRepository =
      new InMemoryEmailAlreadyExistsRepository();
    const createUserController = new CreateUserController(
      inMemoryUserRepository,
      inMemoryEmailAlreadyExistsRepository
    );

    jest
      .spyOn(inMemoryUserRepository, "createUser")
      .mockImplementationOnce(() => {
        throw new Error();
      });

    const { body, statusCode } = await createUserController.handle({
      body: { ...user, email: "johndoe2@gmail.com" },
    });

    expect(body).toEqual("Internal Server Error");
    expect(statusCode).toBe(500);
  });
});
