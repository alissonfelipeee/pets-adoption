import { CreatePetController } from "../../controllers/pets/create-pets/create-pets";
import {
  InMemoryGetUserByEmailRepository,
  InMemoryGetUserByIdRepository,
  InMemoryPetRepository,
  InMemoryUserRepository,
} from "../repositories/in-memory";
import { CreateUserController } from "../../controllers/users/create-user/create-user";
import { AuthUserService } from "../../services/auth-user/auth-user";
import { AuthUserController } from "../../controllers/users/auth-user/auth-user";
import { petExample, userExample } from "../utils/global";
import { Pet } from "../../models/Pet";

let token: string;

describe("Create pet", () => {
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

  it("should create a pet", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const createPetController = new CreatePetController(
      inMemoryPetRepository,
      inMemoryGetUserByIdRepository
    );

    const { body, statusCode } = await createPetController.handle({
      body: petExample,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual(petExample);
    expect(statusCode).toBe(201);
  });

  it("should not be able create pet because not exists a body in request", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const createPetController = new CreatePetController(
      inMemoryPetRepository,
      inMemoryGetUserByIdRepository
    );

    const { body, statusCode } = await createPetController.handle({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Bad Request - Missing body");
    expect(statusCode).toBe(400);
  });

  it("should not be able create pet because not exists a header: authorization", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const createPetController = new CreatePetController(
      inMemoryPetRepository,
      inMemoryGetUserByIdRepository
    );

    const { body, statusCode } = await createPetController.handle({
      body: petExample,
      headers: {},
    });

    expect(body).toEqual("Bad Request - Missing header: authorization");
    expect(statusCode).toBe(400);
  });

  it("should not be able create pet because missing fields in body", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const createPetController = new CreatePetController(
      inMemoryPetRepository,
      inMemoryGetUserByIdRepository
    );

    const { body, statusCode } = await createPetController.handle({
      body: {
        name: "Dog",
        breed: "Pitbull",
        owner: userExample,
      } as Pet,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Bad Request - Missing field: age");
    expect(statusCode).toBe(400);
  });

  it("should not be able create pet because invalid fields", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const createPetController = new CreatePetController(
      inMemoryPetRepository,
      inMemoryGetUserByIdRepository
    );

    const { body, statusCode } = await createPetController.handle({
      body: {
        name: "",
        age: 1,
        breed: "Pitbull",
        owner: userExample,
        available: true,
      } as Pet,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Bad Request - Invalid field: name");
    expect(statusCode).toBe(400);
  });

  it("should not be able create pet because invalid token", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const createPetController = new CreatePetController(
      inMemoryPetRepository,
      inMemoryGetUserByIdRepository
    );

    const { body, statusCode } = await createPetController.handle({
      body: petExample,
      headers: {
        authorization: `Bearer ${token}1`,
      },
    });

    expect(body).toEqual("Unauthorized - Invalid token");
    expect(statusCode).toBe(401);
  });

  it("should not be able create pet because occurred internal error", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const createPetController = new CreatePetController(
      inMemoryPetRepository,
      inMemoryGetUserByIdRepository
    );

    jest
      .spyOn(inMemoryPetRepository, "createPet")
      .mockImplementationOnce(async () => {
        throw new Error();
      });

    const { body, statusCode } = await createPetController.handle({
      body: petExample,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Internal Server Error");
    expect(statusCode).toBe(500);
  });

  it("should not be able create pet because user not exists", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const createPetController = new CreatePetController(
      inMemoryPetRepository,
      inMemoryGetUserByIdRepository
    );

    await inMemoryUserRepository.delete(userExample.id);

    const { body, statusCode } = await createPetController.handle({
      body: petExample,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Bad Request - User not found");
    expect(statusCode).toBe(400);
  });
});
