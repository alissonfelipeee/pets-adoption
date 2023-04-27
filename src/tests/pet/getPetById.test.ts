import { GetPetByIdController } from "./../../controllers/pets/get-pet-by-id/get-pet-by-id";
import { CreatePetController } from "../../controllers/pets/create-pets/create-pets";
import { AuthUserController } from "../../controllers/users/auth-user/auth-user";
import { CreateUserController } from "../../controllers/users/create-user/create-user";
import { AuthUserService } from "../../services/auth-user/auth-user";
import {
  InMemoryGetUserByEmailRepository,
  InMemoryGetUserByIdRepository,
  InMemoryPetRepository,
  InMemoryUserRepository,
} from "../repositories/in-memory";
import { petExample, userExample } from "../utils/global";

const inMemoryUserRepository = new InMemoryUserRepository();
const inMemoryGetUserByEmailRepository = new InMemoryGetUserByEmailRepository();
const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
const inMemoryPetRepository = new InMemoryPetRepository();

const createUserController = new CreateUserController(
  inMemoryUserRepository,
  inMemoryGetUserByEmailRepository
);

const authUserService = new AuthUserService(inMemoryGetUserByEmailRepository);
const authUserController = new AuthUserController(authUserService);

const createPetController = new CreatePetController(
  inMemoryPetRepository,
  inMemoryGetUserByIdRepository
);

const getPetByIdController = new GetPetByIdController(inMemoryPetRepository);

let token: string;

describe("Get Pet by ID", () => {
  beforeAll(async () => {
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

    await createPetController.handle({
      body: petExample,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
  });

  it("should return pet with id 1", async () => {
    const { body, statusCode } = await getPetByIdController.handle({
      params: {
        id: 1,
      },
    });

    expect(body).toEqual(petExample);
    expect(statusCode).toBe(200);
  });

  it("should not be able get pet by id because pet not exists", async () => {
    const { body, statusCode } = await getPetByIdController.handle({
      params: {
        id: 2,
      },
    });

    expect(body).toEqual("Not found - Pet not found");
    expect(statusCode).toBe(404);
  });

  it("should not be able get pet by id because not exists a param: id", async () => {
    const { body, statusCode } = await getPetByIdController.handle({
      params: {},
    });

    expect(body).toEqual("Bad Request - Missing param: id");
    expect(statusCode).toBe(400);
  });

  it("should not be able get pet by id because occured internal error", async () => {
    jest.spyOn(inMemoryPetRepository, "getPetById").mockImplementation(() => {
      throw new Error();
    });

    const { body, statusCode } = await getPetByIdController.handle({
      params: {
        id: 1,
      },
    });

    expect(body).toEqual("Internal Server Error");
    expect(statusCode).toBe(500);
  });
});
