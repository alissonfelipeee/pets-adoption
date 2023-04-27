import { AuthUserController } from "../../controllers/users/auth-user/auth-user";
import { AuthUserParams } from "../../controllers/users/auth-user/protocols";
import { CreateUserController } from "../../controllers/users/create-user/create-user";
import { AuthUserService } from "../../services/auth-user/auth-user";
import {
  InMemoryGetUserByEmailRepository,
  InMemoryUserRepository,
} from "../repositories/in-memory";
import { userExample } from "../utils/global";

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
      body: userExample,
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
        email: userExample.email,
        password: userExample.password,
      },
    });

    expect(statusCode).toBe(200);
  });

  it("should not be able auth user because not exists a body in request", async () => {
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

  it("should not be able auth user because missing field in body: email", async () => {
    const inMemoryGetUserByEmailRepository =
      new InMemoryGetUserByEmailRepository();
    const authUserService = new AuthUserService(
      inMemoryGetUserByEmailRepository
    );
    const authUserController = new AuthUserController(authUserService);

    const { body, statusCode } = await authUserController.handle({
      body: {
        password: userExample.password,
      } as AuthUserParams,
    });

    expect(body).toEqual("Bad Request - Missing param: email");
    expect(statusCode).toBe(400);
  });

  it("should not be able auth user because missing field in body: password", async () => {
    const inMemoryGetUserByEmailRepository =
      new InMemoryGetUserByEmailRepository();
    const authUserService = new AuthUserService(
      inMemoryGetUserByEmailRepository
    );
    const authUserController = new AuthUserController(authUserService);

    const { body, statusCode } = await authUserController.handle({
      body: {
        email: userExample.email,
      } as AuthUserParams,
    });

    expect(body).toEqual("Bad Request - Missing param: password");
    expect(statusCode).toBe(400);
  });

  it("should not be able auth user because user not exists", async () => {
    const inMemoryGetUserByEmailRepository =
      new InMemoryGetUserByEmailRepository();
    const authUserService = new AuthUserService(
      inMemoryGetUserByEmailRepository
    );
    const authUserController = new AuthUserController(authUserService);

    const { body, statusCode } = await authUserController.handle({
      body: {
        email: "johndoe2@gmail.com",
        password: userExample.password,
      },
    });

    expect(body).toEqual("Unauthorized - Invalid credentials");
    expect(statusCode).toBe(401);
  });

  it("should not be able auth user because password is incorrect", async () => {
    const inMemoryGetUserByEmailRepository =
      new InMemoryGetUserByEmailRepository();
    const authUserService = new AuthUserService(
      inMemoryGetUserByEmailRepository
    );
    const authUserController = new AuthUserController(authUserService);

    const { body, statusCode } = await authUserController.handle({
      body: {
        email: userExample.email,
        password: "1234567",
      },
    });

    expect(body).toEqual("Unauthorized - Invalid credentials");
    expect(statusCode).toBe(401);
  });

  it("should not be able auth user because occured internal error", async () => {
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

    const { body, statusCode } = await authUserController.handle({
      body: {
        email: userExample.email,
        password: userExample.password,
      },
    });

    expect(body).toEqual("Internal Server Error");
    expect(statusCode).toBe(500);
  });
});
