import { CreatePetController } from "../../controllers/pets/create-pets/create-pets";
import { UpdatePetAdopterController } from "../../controllers/pets/update-pet-adopter/update-pet-adopter";
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
const updatePetAdopterController = new UpdatePetAdopterController(
  inMemoryPetRepository,
  inMemoryGetUserByIdRepository,
  inMemoryGetPetByIdRepository
);

let token: string;
let token2: string;

describe("Update Pet Adopter", () => {
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

    // auth another user
    const response = await authUserController.handle({
      body: {
        email: "johndoe2@gmail.com",
        password: userExample.password,
      },
    });

    const bodyinJsonAnotherUser = JSON.stringify(response.body);
    token2 = JSON.parse(bodyinJsonAnotherUser).token;

    // create another pet that owner is the first user
    await createPetController.handle({
      body: petExample,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
  });

  it("should be able to adopt a pet", async () => {
    const { statusCode, body } = await updatePetAdopterController.handle({
      params: {
        id: 1,
      },
      headers: {
        authorization: `Bearer ${token2}`,
      },
    });

    expect(body).toHaveProperty("adopterId");
    expect(statusCode).toBe(200);
  });

  it("should not be able to adopt a pet because missing param: id", async () => {
    const { statusCode, body } = await updatePetAdopterController.handle({
      params: {},
      headers: {
        authorization: `Bearer ${token2}`,
      },
    });

    expect(body).toEqual("Bad Request - Missing param: id");
    expect(statusCode).toBe(400);
  });

  it("should not be able to adopt a pet because missing header: authorization", async () => {
    const { statusCode, body } = await updatePetAdopterController.handle({
      params: {
        id: 1,
      },
      headers: {},
    });

    expect(body).toEqual("Bad Request - Missing header: authorization");
    expect(statusCode).toBe(400);
  });

  it("should not be able to adopt a pet because pet not exists", async () => {
    const { statusCode, body } = await updatePetAdopterController.handle({
      params: {
        id: 3,
      },
      headers: {
        authorization: `Bearer ${token2}`,
      },
    });

    expect(body).toEqual("Not found - Pet not found");
    expect(statusCode).toBe(404);
  });

  it("should not be able to adopt a pet because pet already adopted", async () => {
    const { statusCode, body } = await updatePetAdopterController.handle({
      params: {
        id: 1,
      },
      headers: {
        authorization: `Bearer ${token2}`,
      },
    });

    expect(body).toEqual("Bad Request - Pet not available");
    expect(statusCode).toBe(400);
  });

  it("should not be able to adopt a pet because token is invalid", async () => {
    const { statusCode, body } = await updatePetAdopterController.handle({
      params: {
        id: 2,
      },
      headers: {
        authorization: `Bearer ${token2}1`,
      },
    });

    expect(body).toEqual("Unauthorized - Invalid token");
    expect(statusCode).toBe(401);
  });

  it("should not be able update pet adopter because token not belongs to this user", async () => {
    const { statusCode, body } = await updatePetAdopterController.handle({
      params: {
        id: 2,
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Bad Request - You are the owner of this pet");
    expect(statusCode).toBe(400);
  });

  it("should not be able update pet adopter because occured internal error", async () => {
    jest
      .spyOn(inMemoryPetRepository, "updatePetAdopter")
      .mockImplementationOnce(() => {
        throw new Error();
      });

    const { statusCode, body } = await updatePetAdopterController.handle({
      params: {
        id: 2,
      },
      headers: {
        authorization: `Bearer ${token2}`,
      },
    });

    expect(body).toEqual("Internal Server Error");
    expect(statusCode).toBe(500);
  });
});
