import { AuthUserController } from "../../controllers/users/auth-user/auth-user";
import { AuthUserParams } from "../../controllers/users/auth-user/protocols";
import { CreateUserController } from "../../controllers/users/create-user/create-user";
import { User } from "../../models/User";
import { AuthUserService } from "../../services/auth-user/auth-user";
import {
  InMemoryGetUserByEmailRepository,
  InMemoryUserRepository,
} from "../repositories/in-memory";

const user = {
  firstName: "John",
  lastName: "Doe",
  email: "johndoe@gmail.com",
  password: "123456",
  phone: "(61) 90000-0000",
} as User;

describe("Auth user", () => {
  beforeEach(async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryGetUserByEmailRepository =
      new InMemoryGetUserByEmailRepository();
    const createUserController = new CreateUserController(
      inMemoryUserRepository,
      inMemoryGetUserByEmailRepository
    );

    await createUserController.handle({
      body: user,
    });
  });

  it("should auth user", async () => {
    const inMemoryGetUserByEmailRepository =
      new InMemoryGetUserByEmailRepository();
    const authUserService = new AuthUserService(
      inMemoryGetUserByEmailRepository
    );
    const authUserController = new AuthUserController(authUserService);

    const { statusCode } = await authUserController.handle({
      body: {
        email: user.email,
        password: user.password,
      },
    });

    expect(statusCode).toBe(200);
  });

  it("should not auth user because not exists a body", async () => {
    const inMemoryGetUserByEmailRepository =
      new InMemoryGetUserByEmailRepository();
    const authUserService = new AuthUserService(
      inMemoryGetUserByEmailRepository
    );
    const authUserController = new AuthUserController(authUserService);

    const { body, statusCode } = await authUserController.handle({});

    expect(body).toEqual("Bad Request - Missing body");
    expect(statusCode).toBe(400);
  });

  it("should not auth user because not exists a email", async () => {
    const inMemoryGetUserByEmailRepository =
      new InMemoryGetUserByEmailRepository();
    const authUserService = new AuthUserService(
      inMemoryGetUserByEmailRepository
    );
    const authUserController = new AuthUserController(authUserService);

    const { body, statusCode } = await authUserController.handle({
      body: {
        password: user.password,
      } as AuthUserParams,
    });

    expect(body).toEqual("Bad Request - Missing param: email");
    expect(statusCode).toBe(400);
  });

  it("should not auth user because not exists a password", async () => {
    const inMemoryGetUserByEmailRepository =
      new InMemoryGetUserByEmailRepository();
    const authUserService = new AuthUserService(
      inMemoryGetUserByEmailRepository
    );
    const authUserController = new AuthUserController(authUserService);

    const { body, statusCode } = await authUserController.handle({
      body: {
        email: user.email,
      } as AuthUserParams,
    });

    expect(body).toEqual("Bad Request - Missing param: password");
    expect(statusCode).toBe(400);
  });

  it("should not auth user because not exists a user", async () => {
    const inMemoryGetUserByEmailRepository =
      new InMemoryGetUserByEmailRepository();
    const authUserService = new AuthUserService(
      inMemoryGetUserByEmailRepository
    );
    const authUserController = new AuthUserController(authUserService);

    const { body, statusCode } = await authUserController.handle({
      body: {
        email: "johndoe2@gmail.com",
        password: user.password,
      } as AuthUserParams,
    });

    expect(body).toEqual("Unauthorized - Invalid credentials");
    expect(statusCode).toBe(401);
  });

  it("should not auth user because password is incorrect", async () => {
    const inMemoryGetUserByEmailRepository =
      new InMemoryGetUserByEmailRepository();
    const authUserService = new AuthUserService(
      inMemoryGetUserByEmailRepository
    );
    const authUserController = new AuthUserController(authUserService);

    const { body, statusCode } = await authUserController.handle({
      body: {
        email: user.email,
        password: "1234567",
      } as AuthUserParams,
    });

    expect(body).toEqual("Unauthorized - Invalid credentials");
    expect(statusCode).toBe(401);
  });

  it("should return 500 if something goes wrong", async () => {
    const inMemoryGetUserByEmailRepository =
      new InMemoryGetUserByEmailRepository();
    const authUserService = new AuthUserService(
      inMemoryGetUserByEmailRepository
    );
    const authUserController = new AuthUserController(authUserService);

    jest
      .spyOn(inMemoryGetUserByEmailRepository, "getUserByEmail")
      .mockImplementationOnce(() => {
        throw new Error();
      });

    const { statusCode } = await authUserController.handle({
      body: {
        email: user.email,
        password: user.password,
      } as AuthUserParams,
    });

    expect(statusCode).toBe(500);
  });
});
