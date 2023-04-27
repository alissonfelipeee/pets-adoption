import { User } from "../../models/User";
import { CreateUserController } from "../../controllers/users/create-user/create-user";
import {
  InMemoryGetUserByEmailRepository,
  InMemoryUserRepository,
} from "../repositories/in-memory";
import { userExample } from "../utils/global";

const userWithoutFirstName = {
  lastName: "Doe",
  email: "johndoe@gmail.com",
  password: "123456",
  phone: "(61) 90000-0000",
} as User;

describe("Create user", () => {
  it("should create a user", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryGetUserByEmailRepository =
      new InMemoryGetUserByEmailRepository();
    const createUserController = new CreateUserController(
      inMemoryUserRepository,
      inMemoryGetUserByEmailRepository
    );

    const { body, statusCode } = await createUserController.handle({
      body: userExample,
    });

    const { password, ...userWithoutPassword } = body as User;

    expect(body).toEqual({
      ...userWithoutPassword,
      id: 1,
    });
    expect(statusCode).toBe(201);
  });

  it("should not be able create user because not exists a body in request", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryGetUserByEmailRepository =
      new InMemoryGetUserByEmailRepository();
    const createUserController = new CreateUserController(
      inMemoryUserRepository,
      inMemoryGetUserByEmailRepository
    );

    const { body, statusCode } = await createUserController.handle({});

    expect(body).toEqual("Bad Request - Missing body");
    expect(statusCode).toBe(400);
  });

  it("should not be able create user because missing field in body: firstName", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryGetUserByEmailRepository =
      new InMemoryGetUserByEmailRepository();
    const createUserController = new CreateUserController(
      inMemoryUserRepository,
      inMemoryGetUserByEmailRepository
    );

    const { body, statusCode } = await createUserController.handle({
      body: userWithoutFirstName as User,
    });

    expect(body).toEqual("Bad Request - Missing field: firstName");
    expect(statusCode).toBe(400);
  });

  it("should not be able create user because field empty in body: firstName", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryGetUserByEmailRepository =
      new InMemoryGetUserByEmailRepository();
    const createUserController = new CreateUserController(
      inMemoryUserRepository,
      inMemoryGetUserByEmailRepository
    );

    const { body, statusCode } = await createUserController.handle({
      body: { ...userExample, firstName: "" },
    });

    expect(body).toEqual("Bad Request - Invalid firstName");
    expect(statusCode).toBe(400);
  });

  it("should not be able create user because email is invalid", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryGetUserByEmailRepository =
      new InMemoryGetUserByEmailRepository();
    const createUserController = new CreateUserController(
      inMemoryUserRepository,
      inMemoryGetUserByEmailRepository
    );

    const { body, statusCode } = await createUserController.handle({
      body: { ...userExample, email: "johndoe" },
    });

    expect(body).toEqual("Bad Request - Invalid email");
    expect(statusCode).toBe(400);
  });

  it("should not be able create user because email already exists", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryGetUserByEmailRepository =
      new InMemoryGetUserByEmailRepository();
    const createUserController = new CreateUserController(
      inMemoryUserRepository,
      inMemoryGetUserByEmailRepository
    );

    await createUserController.handle({
      body: userExample,
    });

    const { body, statusCode } = await createUserController.handle({
      body: userExample,
    });

    expect(body).toEqual("Bad Request - Email already exists");
    expect(statusCode).toBe(400);
  });

  it("should not be able create user because occurred internal error", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryGetUserByEmailRepository =
      new InMemoryGetUserByEmailRepository();
    const createUserController = new CreateUserController(
      inMemoryUserRepository,
      inMemoryGetUserByEmailRepository
    );

    jest
      .spyOn(inMemoryUserRepository, "createUser")
      .mockImplementationOnce(() => {
        throw new Error();
      });

    const { body, statusCode } = await createUserController.handle({
      body: { ...userExample, email: "johndoe2@gmail.com" },
    });

    expect(body).toEqual("Internal Server Error");
    expect(statusCode).toBe(500);
  });
});
