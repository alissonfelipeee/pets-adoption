import { AuthUserController } from "../../controllers/users/auth-user/auth-user";
import { CreateUserController } from "../../controllers/users/create-user/create-user";
import { User } from "../../models/User";
import { AuthUserService } from "../../services/auth-user/auth-user";
import { DeleteUserController } from "./../../controllers/users/delete-user/delete-user";
import {
  InMemoryGetUserByEmailRepository,
  InMemoryGetUserByIdRepository,
  InMemoryUserRepository,
} from "../repositories/in-memory";
import { userExample } from "../utils/global";

const inMemoryUserRepository = new InMemoryUserRepository();
const inMemoryGetUserByEmailRepository = new InMemoryGetUserByEmailRepository();
const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();

const createUserController = new CreateUserController(
  inMemoryUserRepository,
  inMemoryGetUserByEmailRepository
);

const authUserService = new AuthUserService(inMemoryGetUserByEmailRepository);
const authUserController = new AuthUserController(authUserService);

const deleteUserController = new DeleteUserController(
  inMemoryUserRepository,
  inMemoryGetUserByIdRepository
);

let token: string;

describe("Delete User", () => {
  beforeEach(async () => {
    await createUserController.handle({
      body: userExample,
    });

    const { body } = await authUserController.handle({
      body: {
        email: userExample.email,
        password: userExample.password,
      },
    });

    const bodyinJson = JSON.stringify(body);
    token = JSON.parse(bodyinJson).token;
  });

  it("should delete user", async () => {
    const { body, statusCode } = await deleteUserController.handle({
      params: {
        id: 1,
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    const { password, ...userWithoutPassword } = body as User;

    expect(body).toEqual(userWithoutPassword);
    expect(statusCode).toBe(200);
  });

  it("should not be able delete user because not exists a param: id", async () => {
    const { body, statusCode } = await deleteUserController.handle({
      params: {},
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Bad Request - Missing param: id");
    expect(statusCode).toBe(400);
  });

  it("should not be able delete user because not exists a header: authorization", async () => {
    const { body, statusCode } = await deleteUserController.handle({
      params: {
        id: 1,
      },
      headers: {},
    });

    expect(body).toEqual("Bad Request - Missing header: authorization");
    expect(statusCode).toBe(400);
  });

  it("should not be able delete user because user not exists", async () => {
    const { body, statusCode } = await deleteUserController.handle({
      params: {
        id: 2,
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Not Found - User not found");
    expect(statusCode).toBe(404);
  });

  it("should not be able delete user because token is invalid", async () => {
    const { body, statusCode } = await deleteUserController.handle({
      params: {
        id: 1,
      },
      headers: {
        authorization: `Bearer ${token}1`,
      },
    });

    expect(body).toEqual("Unauthorized - Invalid token");
    expect(statusCode).toBe(401);
  });

  it("should not be able delete user because token not belongs to this user", async () => {
    await inMemoryUserRepository.createUser(userExample);

    const { body, statusCode } = await deleteUserController.handle({
      params: {
        id: 2,
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Unauthorized - Invalid token for this user");
    expect(statusCode).toBe(401);
  });

  it("should not be able delete user because occured internal error", async () => {
    jest.spyOn(inMemoryUserRepository, "delete").mockImplementationOnce(() => {
      throw new Error();
    });

    const { body, statusCode } = await deleteUserController.handle({
      params: {
        id: 1,
      },
    });

    expect(body).toEqual("Internal Server Error");
    expect(statusCode).toBe(500);
  });
});
