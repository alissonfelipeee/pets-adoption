import { AuthUserController } from "../../controllers/users/auth-user/auth-user";
import { CreateUserController } from "../../controllers/users/create-user/create-user";
import { AuthUserService } from "../../services/auth-user/auth-user";
import {
  InMemoryGetPetByIdRepository,
  InMemoryGetUserByEmailRepository,
  InMemoryGetUserByIdRepository,
  InMemoryPetRepository,
  InMemoryUserRepository,
} from "../repositories/in-memory";
import { CreatePetController } from "../../controllers/pets/create-pets/create-pets";
import { DeletePetController } from "../../controllers/pets/delete-pet/delete-pet";
import { petExample, userExample } from "../utils/global";

const inMemoryUserRepository = new InMemoryUserRepository();
const inMemoryGetUserByEmailRepository = new InMemoryGetUserByEmailRepository();
const createUserController = new CreateUserController(
  inMemoryUserRepository,
  inMemoryGetUserByEmailRepository
);

const authUserService = new AuthUserService(inMemoryGetUserByEmailRepository);
const authUserController = new AuthUserController(authUserService);

const inMemoryPetRepository = new InMemoryPetRepository();
const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
const createPetController = new CreatePetController(
  inMemoryPetRepository,
  inMemoryGetUserByIdRepository
);

const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
const deletePetController = new DeletePetController(
  inMemoryPetRepository,
  inMemoryGetPetByIdRepository
);

let token: string;

describe("Delete Pet", () => {
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

  it("should delete pet", async () => {
    const { body, statusCode } = await deletePetController.handle({
      params: {
        id: 1,
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual(petExample);
    expect(statusCode).toBe(200);
  });

  it("should not be able delete pet because not exists a param: id", async () => {
    const { body, statusCode } = await deletePetController.handle({
      params: {},
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Missing param: id");
    expect(statusCode).toBe(400);
  });

  it("should not be able delete pet because not exists a header: authorization", async () => {
    const { body, statusCode } = await deletePetController.handle({
      params: {
        id: 1,
      },
      headers: {},
    });

    expect(body).toEqual("Bad Request - Missing header: authorization");
    expect(statusCode).toBe(400);
  });

  it("should not be able delete pet because pet not exists", async () => {
    const { body, statusCode } = await deletePetController.handle({
      params: {
        id: 2,
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Not found - Pet not found");
    expect(statusCode).toBe(404);
  });

  it("should not be able delete pet because token is invalid", async () => {
    await inMemoryPetRepository.createPet(petExample);

    const { body, statusCode } = await deletePetController.handle({
      params: {
        id: 1,
      },
      headers: {
        authorization: `Bearer ${token}invalid`,
      },
    });

    expect(body).toEqual("Unauthorized - Invalid token");
    expect(statusCode).toBe(401);
  });

  it("should not be able delete pet because token not belongs to this user", async () => {
    const responseCreatePet = await inMemoryUserRepository.createUser({
      ...userExample,
      email: "johndoe2@gmail.com",
    });

    await inMemoryPetRepository.createPet({
      ...petExample,
      owner: responseCreatePet,
    });

    const { body, statusCode } = await deletePetController.handle({
      params: {
        id: 2,
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Unauthorized - Invalid token for delete this pet");
    expect(statusCode).toBe(401);
  });

  it("should not be able delete pet because occured internal error", async () => {
    jest
      .spyOn(inMemoryPetRepository, "delete")
      .mockImplementationOnce(async () => {
        throw new Error("Any error");
      });

    const { body, statusCode } = await deletePetController.handle({
      params: {
        id: 1,
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Internal Server Error");
    expect(statusCode).toBe(500);
  });
});
