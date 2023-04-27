import { AuthUserController } from "../../controllers/users/auth-user/auth-user";
import { CreateUserController } from "../../controllers/users/create-user/create-user";
import { User } from "../../models/User";
import { AuthUserService } from "../../services/auth-user/auth-user";
import { UpdateUserController } from "./../../controllers/users/update-user/update-user";
import {
  InMemoryGetUserByEmailRepository,
  InMemoryUserRepository,
} from "../repositories/in-memory";
import { userExample } from "../utils/global";

let token: string;

describe("Update User", () => {
  beforeAll(async () => {
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

    const authUserService = new AuthUserService(
      inMemoryGetUserByEmailRepository
    );
    const authUserController = new AuthUserController(authUserService);

    const { body } = await authUserController.handle({
      body: {
        email: userExample.email,
        password: userExample.password,
      },
    });

    const bodyinJson = JSON.stringify(body);
    token = JSON.parse(bodyinJson).token;
  });

  it("should update user", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const updateUserController = new UpdateUserController(
      inMemoryUserRepository
    );

    const { statusCode, body } = await updateUserController.handle({
      params: {
        id: 1,
      },
      body: {
        lastName: "Doe Jr",
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    const { password, ...userWithoutPassword } = body as User;

    expect(body).toEqual({
      ...userWithoutPassword,
      lastName: "Doe Jr",
    });
    expect(statusCode).toBe(200);
  });

  it("should update user and update password", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const updateUserController = new UpdateUserController(
      inMemoryUserRepository
    );

    const { statusCode, body } = await updateUserController.handle({
      params: {
        id: 1,
      },
      body: {
        lastName: "Doe Jr",
        password: "1234567",
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    const { password, ...userWithoutPassword } = body as User;

    expect(body).toEqual({
      ...userWithoutPassword,
      lastName: "Doe Jr",
    });
    expect(statusCode).toBe(200);
  });

  it("should not be able update user because not exists a param: id", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const updateUserController = new UpdateUserController(
      inMemoryUserRepository
    );

    const { statusCode, body } = await updateUserController.handle({
      params: {},
      body: {
        lastName: "Doe Jr",
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Bad Request - Missing param: id");
    expect(statusCode).toBe(400);
  });

  it("should not be able update user because not exists a header: authorization", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const updateUserController = new UpdateUserController(
      inMemoryUserRepository
    );

    const { statusCode, body } = await updateUserController.handle({
      params: {
        id: 1,
      },
      body: {
        lastName: "Doe Jr",
      },
      headers: {},
    });

    expect(body).toEqual("Bad Request - Missing header: authorization");
    expect(statusCode).toBe(400);
  });

  it("should not be able update user because not exists a body in request", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const updateUserController = new UpdateUserController(
      inMemoryUserRepository
    );

    const { statusCode, body } = await updateUserController.handle({
      params: {
        id: 1,
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Bad Request - Missing body");
    expect(statusCode).toBe(400);
  });

  it("should not be able update user because token is invalid", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const updateUserController = new UpdateUserController(
      inMemoryUserRepository
    );

    const { statusCode, body } = await updateUserController.handle({
      params: {
        id: 1,
      },
      body: {
        lastName: "Doe Jr",
      },
      headers: {
        authorization: `Bearer ${token}123`,
      },
    });

    expect(body).toEqual("Unauthorized - Invalid token");
    expect(statusCode).toBe(401);
  });

  it("should not be able update user because token not belongs to this user", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const updateUserController = new UpdateUserController(
      inMemoryUserRepository
    );

    await inMemoryUserRepository.createUser(userExample);

    const { statusCode, body } = await updateUserController.handle({
      params: {
        id: 2,
      },
      body: {
        lastName: "Doe Jr",
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Unauthorized - Invalid token for this user");
    expect(statusCode).toBe(401);
  });

  it("should not be able update user because invalid fields were received", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const updateUserController = new UpdateUserController(
      inMemoryUserRepository
    );

    const { statusCode, body } = await updateUserController.handle({
      params: {
        id: 1,
      },
      body: {
        email: "johndoe2@gmail.com",
      } as User,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Bad Request - Invalid fields");
    expect(statusCode).toBe(400);
  });

  it("should not be able update user because occured internal error", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const updateUserController = new UpdateUserController(
      inMemoryUserRepository
    );

    jest
      .spyOn(inMemoryUserRepository, "updateUser")
      .mockImplementationOnce(() => {
        throw new Error();
      });

    const user = await updateUserController.handle({
      params: {
        id: 1,
      },
      body: {
        lastName: "Doe Jr",
      },
    });

    expect(user.body).toEqual("Internal Server Error");
    expect(user.statusCode).toBe(500);
  });
});
