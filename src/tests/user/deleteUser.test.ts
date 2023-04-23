import { AuthUserController } from "../../controllers/users/auth-user/auth-user";
import { CreateUserController } from "../../controllers/users/create-user/create-user";
import { User } from "../../models/User";
import { AuthUserService } from "../../services/auth-user/auth-user";
import { DeleteUserController } from "./../../controllers/users/delete-user/delete-user";
import {
  InMemoryGetUserByEmailRepository,
  InMemoryGetUserByIdRepository,
  InMemoryUserRepository,
} from "./repositories/in-memory";

const user = {
  firstName: "John",
  lastName: "Doe",
  email: "johndoe@gmail.com",
  password: "123456",
  phone: "(61) 90000-0000",
} as User;

let token: string;

describe("Delete User", () => {
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

    const authUserService = new AuthUserService(
      inMemoryGetUserByEmailRepository
    );
    const authUserController = new AuthUserController(authUserService);

    const { statusCode, body } = await authUserController.handle({
      body: {
        email: user.email,
        password: user.password,
      },
    });

    const newbody = JSON.stringify(body);
    token = JSON.parse(newbody).token;
  });

  it("should delete user", async () => {
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
      headers: {
        authorization: `Bearer ${token}`,
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
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Missing param: id");
    expect(statusCode).toBe(400);
  });

  it("should return error because missing authorization", async () => {
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
      headers: {},
    });

    expect(body).toEqual("Bad Request - Missing header: authorization");
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
        id: 2,
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("User not found");
    expect(statusCode).toBe(404);
  });

  it("should return error because token is invalid", async () => {
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
      headers: {
        authorization: `Bearer ${token}1`,
      },
    });

    expect(body).toEqual("Unauthorized - Invalid token");
    expect(statusCode).toBe(401);
  });

  it("should return error because token invalid for this user", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const deleteUserController = new DeleteUserController(
      inMemoryUserRepository,
      inMemoryGetUserByIdRepository
    );

    await inMemoryUserRepository.createUser(user);

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

  it("should return 500 if something goes wrong", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const deleteUserController = new DeleteUserController(
      inMemoryUserRepository,
      inMemoryGetUserByIdRepository
    );

    jest.spyOn(inMemoryUserRepository, "delete").mockImplementationOnce(() => {
      throw new Error();
    });

    const { body, statusCode } = await deleteUserController.handle({
      params: {
        id: 1,
      },
    });

    expect(body).toBe("Internal Server Error");
    expect(statusCode).toBe(500);
  });
});
