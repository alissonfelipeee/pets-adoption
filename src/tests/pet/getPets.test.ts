import { CreatePetController } from "../../controllers/pets/create-pets/create-pets";
import { GetPetsController } from "../../controllers/pets/get-pets/get-pets";
import { AuthUserController } from "../../controllers/users/auth-user/auth-user";
import { CreateUserController } from "../../controllers/users/create-user/create-user";
import { Pet } from "../../models/Pet";
import { User } from "../../models/User";
import { AuthUserService } from "../../services/auth-user/auth-user";
import {
  InMemoryGetUserByEmailRepository,
  InMemoryGetUserByIdRepository,
  InMemoryPetRepository,
  InMemoryUserRepository,
} from "../repositories/in-memory";

const user = {
  id: 1,
  firstName: "John",
  lastName: "Doe",
  email: "johndoe@gmail.com",
  password: "123456",
  phone: "(61) 90000-0000",
} as User;

const pet = {
  id: 1,
  name: "Dog",
  age: 1,
  breed: "Pitbull",
  owner: user,
  available: true,
} as Pet;

let token: string;

describe("Get pets", () => {
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

    const { body } = await authUserController.handle({
      body: {
        email: user.email,
        password: user.password,
      },
    });

    const newbody = JSON.stringify(body);
    token = JSON.parse(newbody).token;
  });

  it("should return a empty list of pets", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const getPetsController = new GetPetsController(inMemoryPetRepository);

    const { body, statusCode } = await getPetsController.handle();

    expect(body).toEqual([]);
    expect(statusCode).toBe(200);
  });

  it("should return a list of pets with 1 pet", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const getPetsController = new GetPetsController(inMemoryPetRepository);

    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const createPetController = new CreatePetController(
      inMemoryPetRepository,
      inMemoryGetUserByIdRepository
    );

    await createPetController.handle({
      body: pet,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    const { body, statusCode } = await getPetsController.handle();

    expect(body).toEqual([pet]);
    expect(statusCode).toBe(200);
  });

  it("should return 500 if something goes wrong", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const getPetsController = new GetPetsController(inMemoryPetRepository);

    jest.spyOn(inMemoryPetRepository, "getPets").mockImplementation(() => {
      throw new Error();
    });

    const { body, statusCode } = await getPetsController.handle();

    expect(body).toBe("Internal Server Error");
    expect(statusCode).toBe(500);
  });
});
