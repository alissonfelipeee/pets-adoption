import { AuthUserController } from "../../controllers/users/auth-user/auth-user";
import { CreateUserController } from "../../controllers/users/create-user/create-user";
import { User } from "../../models/User";
import { AuthUserService } from "../../services/auth-user/auth-user";
import {
  InMemoryGetPetByIdRepository,
  InMemoryGetUserByEmailRepository,
  InMemoryGetUserByIdRepository,
  InMemoryPetRepository,
  InMemoryUserRepository,
} from "../repositories/in-memory";
import { Pet } from "../../models/Pet";
import { CreatePetController } from "../../controllers/pets/create-pets/create-pets";
import { DeletePetController } from "../../controllers/pets/delete-pet/delete-pet";

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

describe("Delete Pet", () => {
  beforeAll(async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryGetUserByEmailRepository =
      new InMemoryGetUserByEmailRepository();
    const createUserController = new CreateUserController(
      inMemoryUserRepository,
      inMemoryGetUserByEmailRepository
    );

    // create user

    await createUserController.handle({
      body: user,
    });

    const authUserService = new AuthUserService(
      inMemoryGetUserByEmailRepository
    );
    const authUserController = new AuthUserController(authUserService);

    // auth user

    const { body } = await authUserController.handle({
      body: {
        email: user.email,
        password: user.password,
      },
    });

    const newbody = JSON.stringify(body);
    token = JSON.parse(newbody).token;

    // create pet

    const inMemoryPetRepository = new InMemoryPetRepository();
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
  });

  it("should delete pet", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const deletePetController = new DeletePetController(
      inMemoryPetRepository,
      inMemoryGetPetByIdRepository
    );

    const { body, statusCode } = await deletePetController.handle({
      params: {
        id: 1,
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual(pet);
    expect(statusCode).toBe(200);
  });

  it("should not delete pet because missing param id", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const deletePetController = new DeletePetController(
      inMemoryPetRepository,
      inMemoryGetPetByIdRepository
    );

    const { body, statusCode } = await deletePetController.handle({
      params: {},
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Missing param: id");
    expect(statusCode).toBe(400);
  });

  it("should not delete pet because missing header authorization", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const deletePetController = new DeletePetController(
      inMemoryPetRepository,
      inMemoryGetPetByIdRepository
    );

    const { body, statusCode } = await deletePetController.handle({
      params: {
        id: 1,
      },
      headers: {},
    });

    expect(body).toEqual("Bad Request - Missing header: authorization");
    expect(statusCode).toBe(400);
  });

  it("should not delete because pet not exists", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const deletePetController = new DeletePetController(
      inMemoryPetRepository,
      inMemoryGetPetByIdRepository
    );

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

  it("should not delete pet because token is invalid", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const deletePetController = new DeletePetController(
      inMemoryPetRepository,
      inMemoryGetPetByIdRepository
    );

    await inMemoryPetRepository.createPet(pet);

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

  it("should not delete pet because token is not from the pet's creator", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const deletePetController = new DeletePetController(
      inMemoryPetRepository,
      inMemoryGetPetByIdRepository
    );

    const responseCreatePet = await inMemoryUserRepository.createUser({
      ...user,
      email: "johndoe2@gmail.com",
    });

    await inMemoryPetRepository.createPet({
      ...pet,
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

  it("should not delete pet because occurred an internal error", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const deletePetController = new DeletePetController(
      inMemoryPetRepository,
      inMemoryGetPetByIdRepository
    );

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
