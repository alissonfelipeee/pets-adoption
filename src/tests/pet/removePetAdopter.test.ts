import { UpdatePetAdopterController } from "./../../controllers/pets/update-pet-adopter/update-pet-adopter";
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
import { petExample, userExample } from "../utils/global";
import { RemovePetAdopterController } from "../../controllers/pets/remove-pet-adopter/remove-pet-adopter";

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
const removePetAdopterController = new RemovePetAdopterController(
  inMemoryPetRepository,
  inMemoryGetPetByIdRepository
);

const updatePetAdopterController = new UpdatePetAdopterController(
  inMemoryPetRepository,
  inMemoryGetUserByIdRepository,
  inMemoryGetPetByIdRepository
);

let token: string;
let token2: string;

describe("Remove Pet Adopter", () => {
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

    // create another user to adopt the pet
    await createUserController.handle({
      body: {
        ...userExample,
        email: "johndoe2@gmail.com",
      },
    });

    const { body: body2 } = await authUserController.handle({
      body: {
        email: "johndoe2@gmail.com",
        password: userExample.password,
      },
    });

    token2 = JSON.parse(JSON.stringify(body2)).token;

    await updatePetAdopterController.handle({
      params: {
        id: 1,
      },
      headers: {
        authorization: `Bearer ${token2}`,
      },
    });
  });

  beforeEach(async () => {
    await updatePetAdopterController.handle({
      params: {
        id: 1,
      },
      headers: {
        authorization: `Bearer ${token2}`,
      },
    });
  });

  it("should remove pet adopter", async () => {
    const { body, statusCode } = await removePetAdopterController.handle({
      params: {
        id: 1,
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual({
      ...petExample,
      adopterId: null,
    });
    expect(statusCode).toBe(200);
  });

  it("should not be able remove pet adopter because not exists a param: id", async () => {
    const { body, statusCode } = await removePetAdopterController.handle({
      params: {},
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Missing param: id");
    expect(statusCode).toBe(400);
  });

  it("should not be able remove pet adopter because not exists a header: authorization", async () => {
    const { body, statusCode } = await removePetAdopterController.handle({
      params: {
        id: 1,
      },
      headers: {},
    });

    expect(body).toEqual("Bad Request - Missing header: authorization");
    expect(statusCode).toBe(400);
  });

  it("should not be able remove pet adopter because pet not exists", async () => {
    const { body, statusCode } = await removePetAdopterController.handle({
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

  it("should not be able remove pet adopter because token is invalid", async () => {
    const { body, statusCode } = await removePetAdopterController.handle({
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

  it("should not be able remove pet adopter because pet not have adopter", async () => {
    await removePetAdopterController.handle({
      params: {
        id: 1,
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    const { body, statusCode } = await removePetAdopterController.handle({
      params: {
        id: 1,
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Bad Request - Pet not have adopter");
    expect(statusCode).toBe(400);
  });

  it("should not be able remove pet adopter because token not belongs to this user", async () => {
    const { body, statusCode } = await removePetAdopterController.handle({
      params: {
        id: 1,
      },
      headers: {
        authorization: `Bearer ${token2}`,
      },
    });

    expect(body).toEqual("Unauthorized - You are not the owner of this pet");
    expect(statusCode).toBe(401);
  });

  it("should not be able remove pet adopter because occured internal error", async () => {
    jest
      .spyOn(inMemoryPetRepository, "removePetAdopter")
      .mockImplementationOnce(async () => {
        throw new Error("Any error");
      });

    const { body, statusCode } = await removePetAdopterController.handle({
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
