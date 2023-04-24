import { GetPetByIdController } from "./../../controllers/pets/get-pet-by-id/get-pet-by-id";
import { CreatePetController } from "../../controllers/pets/create-pets/create-pets";
import { AuthUserController } from "../../controllers/users/auth-user/auth-user";
import { CreateUserController } from "../../controllers/users/create-user/create-user";
import { Pet } from "../../models/Pet";
import { User } from "../../models/User";
import { AuthUserService } from "../../services/auth-user/auth-user";
import {
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

describe("Get Pet by ID", () => {
  beforeAll(async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryGetUserByEmailRepository =
      new InMemoryGetUserByEmailRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const inMemoryPetRepository = new InMemoryPetRepository();

    const createUserController = new CreateUserController(
      inMemoryUserRepository,
      inMemoryGetUserByEmailRepository
    );

    await createUserController.handle({
      body: user,
    });

    const authUserService = new AuthUserService(
      inMemoryGetUserByEmailRepository
    );
    const authUserController = new AuthUserController(authUserService);

    const { body } = await authUserController.handle({
      body: {
        email: user.email,
        password: user.password,
      },
    });

    const newbody = JSON.stringify(body);
    token = JSON.parse(newbody).token;

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

  it("should return pet with id 1", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const getPetByIdController = new GetPetByIdController(
      inMemoryPetRepository
    );

    const { body, statusCode } = await getPetByIdController.handle({
      params: {
        id: 1,
      },
    });

    expect(body).toEqual(pet);
    expect(statusCode).toBe(200);
  });

  it("should not return pet because not found", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const getPetByIdController = new GetPetByIdController(
      inMemoryPetRepository
    );

    const { body, statusCode } = await getPetByIdController.handle({
      params: {
        id: 2,
      },
    });

    expect(body).toBe("Not found - Pet not found");
    expect(statusCode).toBe(404);
  });

  it("should not return pet because missing param id", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const getPetByIdController = new GetPetByIdController(
      inMemoryPetRepository
    );

    const { body, statusCode } = await getPetByIdController.handle({
      params: {},
    });

    expect(body).toBe("Missing param: id");
    expect(statusCode).toBe(400);
  });

  it("should return 500 if something goes wrong", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const getPetByIdController = new GetPetByIdController(
      inMemoryPetRepository
    );

    jest.spyOn(inMemoryPetRepository, "getPetById").mockImplementation(() => {
      throw new Error();
    });

    const { body, statusCode } = await getPetByIdController.handle({
      params: {
        id: 1,
      },
    });

    expect(body).toBe("Internal Server Error");
    expect(statusCode).toBe(500);
  });
});
