import { AuthUserController } from "../../controllers/users/auth-user/auth-user";
import { CreateUserController } from "../../controllers/users/create-user/create-user";
import { User } from "../../models/User";
import { AuthUserService } from "../../services/auth-user/auth-user";
import { UpdateUserController } from "./../../controllers/users/update-user/update-user";
import {
  InMemoryGetUserByEmailRepository,
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

  it("should return 400 if id is not provided", async () => {
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

    expect(body).toBe("Bad Request - Missing param: id");
    expect(statusCode).toBe(400);
  });

  it("should return error because missing authorization", async () => {
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

    expect(body).toBe("Bad Request - Missing header: authorization");
    expect(statusCode).toBe(400);
  });

  it("should return 400 if body is not provided", async () => {
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

    expect(body).toBe("Bad Request - Missing body");
    expect(statusCode).toBe(400);
  });

  it("should return error because token is invalid", async () => {
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

    expect(body).toBe("Unauthorized - Invalid token");
    expect(statusCode).toBe(401);
  });

  it("should return error because token invalid for this user", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const updateUserController = new UpdateUserController(
      inMemoryUserRepository
    );

    await inMemoryUserRepository.createUser(user);

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

    expect(body).toBe("Unauthorized - Invalid token for this user");
    expect(statusCode).toBe(401);
  });

  it("should return 400 if there are invalid fields", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const updateUserController = new UpdateUserController(
      inMemoryUserRepository
    ) as any; // I found no other solution to perform this test other than changing the controller type to ANY, so that the error occurs!

    const {statusCode, body} = await updateUserController.handle({
      params: {
        id: 1,
      },
      body: {
        email: "johndoe2@gmail.com",
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toBe("Bad Request - Invalid fields");
    expect(statusCode).toBe(400);
  });

  it("should return 500 if something goes wrong", async () => {
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

    expect(user.body).toBe("Internal Server Error");
    expect(user.statusCode).toBe(500);
  });
});
