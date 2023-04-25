import { CreatePetController } from "../../controllers/pets/create-pets/create-pets";
import { UpdatePetAvailabilityController } from "../../controllers/pets/update-pet-availability/update-pet-availability";
import { AuthUserController } from "../../controllers/users/auth-user/auth-user";
import { CreateUserController } from "../../controllers/users/create-user/create-user";
import { Pet } from "../../models/Pet";
import { User } from "../../models/User";
import { AuthUserService } from "../../services/auth-user/auth-user";
import {
  InMemoryGetPetByIdRepository,
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

describe("Update Pet Availability", () => {
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

  it("should be able to update pet availability", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const updatePetAvailabilityController = new UpdatePetAvailabilityController(
      inMemoryPetRepository,
      inMemoryGetPetByIdRepository
    );

    const { statusCode, body } = await updatePetAvailabilityController.handle({
      params: {
        id: 1,
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual({
      ...pet,
      available: false,
    });
    expect(statusCode).toBe(200);
  });

  it("should not be able to update pet availability because missing param id", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const updatePetAvailabilityController = new UpdatePetAvailabilityController(
      inMemoryPetRepository,
      inMemoryGetPetByIdRepository
    );

    const { statusCode, body } = await updatePetAvailabilityController.handle({
      params: {},
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toBe("Bad Request - Missing param: id");
    expect(statusCode).toBe(400);
  });

  it("should not be able to update pet availability because missing header authorization", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const updatePetAvailabilityController = new UpdatePetAvailabilityController(
      inMemoryPetRepository,
      inMemoryGetPetByIdRepository
    );

    const { statusCode, body } = await updatePetAvailabilityController.handle({
      params: {
        id: 1,
      },
      headers: {},
    });

    expect(body).toBe("Unauthorized - Missing header: authorization");
    expect(statusCode).toBe(401);
  });

  it("should not be able to update pet availability because pet not exists", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const updatePetAvailabilityController = new UpdatePetAvailabilityController(
      inMemoryPetRepository,
      inMemoryGetPetByIdRepository
    );

    const { statusCode, body } = await updatePetAvailabilityController.handle({
      params: {
        id: 2,
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toBe("Not found - Pet not found");
    expect(statusCode).toBe(404);
  });

  it("should not be able to update pet availability because token is invalid", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const updatePetAvailabilityController = new UpdatePetAvailabilityController(
      inMemoryPetRepository,
      inMemoryGetPetByIdRepository
    );

    const { statusCode, body } = await updatePetAvailabilityController.handle({
      params: {
        id: 1,
      },
      headers: {
        authorization: `Bearer ${token}1`,
      },
    });

    expect(body).toBe("Unauthorized - Invalid token");
    expect(statusCode).toBe(401);
  });

  it("should not be able to update pet availability because pet is another user", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const updatePetAvailabilityController = new UpdatePetAvailabilityController(
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

    const { statusCode, body } = await updatePetAvailabilityController.handle({
      params: {
        id: 2,
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toBe("Unauthorized - Invalid token for this user");
    expect(statusCode).toBe(401);
  });

  it("should not be able to update pet availability because internal server error", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const updatePetAvailabilityController = new UpdatePetAvailabilityController(
      inMemoryPetRepository,
      inMemoryGetPetByIdRepository
    );

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

    expect(body).toBe("Internal Server Error");
    expect(statusCode).toBe(500);
  });
});
