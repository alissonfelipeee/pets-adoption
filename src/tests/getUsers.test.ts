import { GetUsersController } from "../controllers/get-users/get-users";
import { InMemoryUserRepository } from "./repositories/in-memory";

const userExample = {
  id: 1,
  firstName: "John",
  lastName: "Doe",
  email: "johndoe@gmail.com",
  password: "123456",
};

describe("Get Users", () => {
  it("should return a empty list of users", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const getUsersController = new GetUsersController(inMemoryUserRepository);

    const { body, statusCode } = await getUsersController.handle();

    expect(body).toEqual([]);
    expect(statusCode).toBe(200);
  });

  it("should return a list of users with 1 user", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const getUsersController = new GetUsersController(inMemoryUserRepository);

    const userCreated = await inMemoryUserRepository.createUser(userExample);

    const { body, statusCode } = await getUsersController.handle();

    // remove password from user

    const { password, ...userWithoutPassword } = userCreated;

    expect(body).toEqual([userWithoutPassword]);
    expect(statusCode).toBe(200);
  });

  it("should return 500 if something goes wrong", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const getUsersController = new GetUsersController(inMemoryUserRepository);

    jest.spyOn(inMemoryUserRepository, "getUsers").mockImplementation(() => {
      throw new Error();
    });

    const { body, statusCode } = await getUsersController.handle();

    expect(body).toBe("Internal Server Error");
    expect(statusCode).toBe(500);
  });
});
