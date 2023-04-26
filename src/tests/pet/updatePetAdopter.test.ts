import { CreatePetController } from "../../controllers/pets/create-pets/create-pets";
import { UpdatePetAdopterController } from "../../controllers/pets/update-pet-adopter/update-pet-adopter";
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
let token2: string;

describe("Update Pet Adopter", () => {
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

    // create another user to adopt the pet

    await createUserController.handle({
      body: {
        ...user,
        email: "johndoe2@gmail.com",
      },
    });

    // auth another user

    const response = await authUserController.handle({
      body: {
        email: "johndoe2@gmail.com",
        password: user.password,
      },
    });

    const newbody2 = JSON.stringify(response.body);
    token2 = JSON.parse(newbody2).token;

    // create another pet that owner is the first user

    await createPetController.handle({
      body: pet,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
  });

  it("should be able to adopt a pet", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const updatePetAdopterController = new UpdatePetAdopterController(
      inMemoryPetRepository,
      inMemoryGetUserByIdRepository,
      inMemoryGetPetByIdRepository
    );

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

  it("should not be able to adopt a pet because missing param id", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const updatePetAdopterController = new UpdatePetAdopterController(
      inMemoryPetRepository,
      inMemoryGetUserByIdRepository,
      inMemoryGetPetByIdRepository
    );

    const { statusCode, body } = await updatePetAdopterController.handle({
      params: {},
      headers: {
        authorization: `Bearer ${token2}`,
      },
    });

    expect(body).toBe("Bad Request - Missing param: id");
    expect(statusCode).toBe(400);
  });

  it("should not be able to adopt a pet because missing header authorization", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const updatePetAdopterController = new UpdatePetAdopterController(
      inMemoryPetRepository,
      inMemoryGetUserByIdRepository,
      inMemoryGetPetByIdRepository
    );

    const { statusCode, body } = await updatePetAdopterController.handle({
      params: {
        id: 1,
      },
      headers: {},
    });

    expect(body).toBe("Unauthorized - Missing header: authorization");
    expect(statusCode).toBe(401);
  });

  it("should not be able to adopt a pet because pet not exists", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const updatePetAdopterController = new UpdatePetAdopterController(
      inMemoryPetRepository,
      inMemoryGetUserByIdRepository,
      inMemoryGetPetByIdRepository
    );

    const { statusCode, body } = await updatePetAdopterController.handle({
      params: {
        id: 3,
      },
      headers: {
        authorization: `Bearer ${token2}`,
      },
    });

    expect(body).toBe("Not found - Pet not found");
    expect(statusCode).toBe(404);
  });

  it("should not be able to adopt a pet because pet already adopted", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const updatePetAdopterController = new UpdatePetAdopterController(
      inMemoryPetRepository,
      inMemoryGetUserByIdRepository,
      inMemoryGetPetByIdRepository
    );

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
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const updatePetAdopterController = new UpdatePetAdopterController(
      inMemoryPetRepository,
      inMemoryGetUserByIdRepository,
      inMemoryGetPetByIdRepository
    );

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

  it("should not be able to adopt a pet because that user owns the pet", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const updatePetAdopterController = new UpdatePetAdopterController(
      inMemoryPetRepository,
      inMemoryGetUserByIdRepository,
      inMemoryGetPetByIdRepository
    );

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

  it("should not be able to update pet adopter because internal server error", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const updatePetAdopterController = new UpdatePetAdopterController(
      inMemoryPetRepository,
      inMemoryGetUserByIdRepository,
      inMemoryGetPetByIdRepository
    );

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

    expect(body).toBe("Internal Server Error");
    expect(statusCode).toBe(500);
  });
});
