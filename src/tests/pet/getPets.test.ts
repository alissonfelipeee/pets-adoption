import { petExample, userExample } from './../utils/global';
import { CreatePetController } from "../../controllers/pets/create-pets/create-pets";
import { GetPetsController } from "../../controllers/pets/get-pets/get-pets";
import { AuthUserController } from "../../controllers/users/auth-user/auth-user";
import { CreateUserController } from "../../controllers/users/create-user/create-user";
import { AuthUserService } from "../../services/auth-user/auth-user";
import {
  InMemoryGetUserByEmailRepository,
  InMemoryGetUserByIdRepository,
  InMemoryPetRepository,
  InMemoryUserRepository,
} from "../repositories/in-memory";

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
      body: petExample,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    const { body, statusCode } = await getPetsController.handle();

    expect(body).toEqual([petExample]);
    expect(statusCode).toBe(200);
  });

  it("should not be able get all pets because occured internal error", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const getPetsController = new GetPetsController(inMemoryPetRepository);

    jest.spyOn(inMemoryPetRepository, "getPets").mockImplementation(() => {
      throw new Error();
    });

    const { body, statusCode } = await getPetsController.handle();

    expect(body).toEqual("Internal Server Error");
    expect(statusCode).toBe(500);
  });
});
