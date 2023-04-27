import { CreatePetController } from "../../controllers/pets/create-pets/create-pets";
import { UpdatePetController } from "../../controllers/pets/update-pet/update-pet";
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
import { petExample, userExample } from "../utils/global";
import { Pet } from "../../models/Pet";

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
const updatePetController = new UpdatePetController(
  inMemoryPetRepository,
  inMemoryGetPetByIdRepository
);

let token: string;

describe("Update Pet", () => {
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

  it("should update a pet", async () => {
    const { statusCode, body } = await updatePetController.handle({
      body: {
        age: 2,
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
      params: {
        id: 1,
      },
    });

    expect(body).toEqual({
      ...petExample,
      age: 2,
    });
    expect(statusCode).toBe(200);
  });

  it("should not be able update petbecause not exists a param: id", async () => {
    const { statusCode, body } = await updatePetController.handle({
      body: {
        age: 2,
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
      params: {},
    });

    expect(body).toEqual("Bad Request - Missing param: id");
    expect(statusCode).toBe(400);
  });

  it("should not be able update petbecause not exists a header: authorization", async () => {
    const { statusCode, body } = await updatePetController.handle({
      body: {
        age: 2,
      },
      headers: {},
      params: {
        id: 1,
      },
    });

    expect(body).toEqual("Bad Request - Missing header: authorization");
    expect(statusCode).toBe(400);
  });

  it("should not be able update petbecause not exists a body in request", async () => {
    const { statusCode, body } = await updatePetController.handle({
      headers: {
        authorization: `Bearer ${token}`,
      },
      params: {
        id: 1,
      },
    });

    expect(body).toEqual("Bad Request - Missing body");
    expect(statusCode).toBe(400);
  });

  it("should not be able update petbecause body is empty", async () => {
    const { statusCode, body } = await updatePetController.handle({
      body: {},
      headers: {
        authorization: `Bearer ${token}`,
      },
      params: {
        id: 1,
      },
    });

    expect(body).toEqual("Bad Request - Empty body");
    expect(statusCode).toBe(400);
  });

  it("should not be able update petbecause pet not exists", async () => {
    const { statusCode, body } = await updatePetController.handle({
      body: {
        age: 2,
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
      params: {
        id: 2,
      },
    });

    expect(body).toEqual("Not found - Pet not found");
    expect(statusCode).toBe(404);
  });

  it("should not be able update petbecause token is invalid", async () => {
    const { statusCode, body } = await updatePetController.handle({
      body: {
        age: 2,
      },
      headers: {
        authorization: `Bearer ${token}1`,
      },
      params: {
        id: 1,
      },
    });

    expect(body).toEqual("Unauthorized - Invalid token");
    expect(statusCode).toBe(401);
  });

  it("should not be able update petbecause token not belongs to this user", async () => {
    await createUserController.handle({
      body: {
        ...userExample,
        email: "johndoe2@gmail.com",
      },
    });

    const responseAuth = await authUserController.handle({
      body: {
        email: "johndoe2@gmail.com",
        password: userExample.password,
      },
    });

    const bodyinJsonAnotherUser = JSON.stringify(responseAuth.body);
    const tokenAnotherUser = JSON.parse(bodyinJsonAnotherUser).token;

    const { statusCode, body } = await updatePetController.handle({
      body: {
        age: 2,
      },
      headers: {
        authorization: `Bearer ${tokenAnotherUser}`,
      },
      params: {
        id: 1,
      },
    });

    expect(body).toEqual("Unauthorized - Invalid token for this user");
    expect(statusCode).toBe(401);
  });

  it("should not be able update petbecause invalid fields were received", async () => {
    const { statusCode, body } = await updatePetController.handle({
      body: {
        weight: 2,
      } as any,
      headers: {
        authorization: `Bearer ${token}`,
      },
      params: {
        id: 1,
      },
    });

    expect(body).toEqual("Bad Request - Invalid fields");
    expect(statusCode).toBe(400);
  });

  it("should not be able update pet because occured internal error", async () => {
    jest
      .spyOn(inMemoryPetRepository, "updatePet")
      .mockImplementationOnce(() => {
        throw new Error();
      });

    const { statusCode, body } = await updatePetController.handle({
      body: {
        age: 2,
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
      params: {
        id: 1,
      },
    });

    expect(body).toEqual("Internal Server Error");
    expect(statusCode).toBe(500);
  });
});
