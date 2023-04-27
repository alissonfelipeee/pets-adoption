import { GetUsersController } from "../../controllers/users/get-users/get-users";
import { InMemoryUserRepository } from "../repositories/in-memory";
import { userExample } from "../utils/global";

const inMemoryUserRepository = new InMemoryUserRepository();
const getUsersController = new GetUsersController(inMemoryUserRepository);

describe("Get Users", () => {
  it("should return a empty list of users", async () => {
    const { body, statusCode } = await getUsersController.handle();

    expect(body).toEqual([]);
    expect(statusCode).toBe(200);
  });

  it("should return a list of users with 1 user", async () => {
    const userCreated = await inMemoryUserRepository.createUser(userExample);

    const { body, statusCode } = await getUsersController.handle();

    const { password, ...userWithoutPassword } = userCreated;

    expect(body).toEqual([userWithoutPassword]);
    expect(statusCode).toBe(200);
  });

  it("should not be able get all users because occured internal error", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const getUsersController = new GetUsersController(inMemoryUserRepository);

    jest.spyOn(inMemoryUserRepository, "getUsers").mockImplementation(() => {
      throw new Error();
    });

    const { body, statusCode } = await getUsersController.handle();

    expect(body).toEqual("Internal Server Error");
    expect(statusCode).toBe(500);
  });
});
