import { CreatePetController } from "../../controllers/pets/create-pets/create-pets";
import { UpdatePetAvailabilityController } from "../../controllers/pets/update-pet-availability/update-pet-availability";
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
const updatePetAvailabilityController = new UpdatePetAvailabilityController(
  inMemoryPetRepository,
  inMemoryGetPetByIdRepository
);

let token: string;

describe("Update Pet Availability", () => {
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

  it("should be able to update pet availability", async () => {
    const { statusCode, body } = await updatePetAvailabilityController.handle({
      params: {
        id: 1,
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual({
      ...petExample,
      available: false,
    });
    expect(statusCode).toBe(200);
  });

  it("should not be able to update pet availability because missing param: id", async () => {
    const { statusCode, body } = await updatePetAvailabilityController.handle({
      params: {},
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Bad Request - Missing param: id");
    expect(statusCode).toBe(400);
  });

  it("should not be able to update pet availability because missing header: authorization", async () => {
    const { statusCode, body } = await updatePetAvailabilityController.handle({
      params: {
        id: 1,
      },
      headers: {},
    });

    expect(body).toEqual("Bad Request - Missing header: authorization");
    expect(statusCode).toBe(400);
  });

  it("should not be able to update pet availability because pet not exists", async () => {
    const { statusCode, body } = await updatePetAvailabilityController.handle({
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

  it("should not be able to update pet availability because token is invalid", async () => {
    const { statusCode, body } = await updatePetAvailabilityController.handle({
      params: {
        id: 1,
      },
      headers: {
        authorization: `Bearer ${token}1`,
      },
    });

    expect(body).toEqual("Unauthorized - Invalid token");
    expect(statusCode).toBe(401);
  });

  it("should not be able update pet availability because token not belongs to this user", async () => {
    const responseCreatePet = await inMemoryUserRepository.createUser({
      ...userExample,
      email: "johndoe2@gmail.com",
    });

    await inMemoryPetRepository.createPet({
      ...petExample,
      owner: responseCreatePet,
    });

    const { statusCode, body } = await updatePetAvailabilityController.handle({
      params: {
        id: 2,
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Unauthorized - Invalid token for this user");
    expect(statusCode).toBe(401);
  });

  it("should not be able update pet availability because occured internal error", async () => {
    jest
      .spyOn(inMemoryPetRepository, "updatePetAvailability")
      .mockImplementationOnce(() => {
        throw new Error();
      });

    const { statusCode, body } = await updatePetAvailabilityController.handle({
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
