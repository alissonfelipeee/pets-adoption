import { CreatePetController } from "../../controllers/pets/create-pets/create-pets";
import {
  InMemoryGetUserByEmailRepository,
  InMemoryGetUserByIdRepository,
  InMemoryPetRepository,
  InMemoryUserRepository,
} from "../repositories/in-memory";
import { CreateUserController } from "../../controllers/users/create-user/create-user";
import { User } from "../../models/User";
import { AuthUserService } from "../../services/auth-user/auth-user";
import { AuthUserController } from "../../controllers/users/auth-user/auth-user";
import { Pet } from "../../models/Pet";

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
};

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
  });

  it("should create a pet", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const createPetController = new CreatePetController(
      inMemoryPetRepository,
      inMemoryGetUserByIdRepository
    );

    const { body, statusCode } = await createPetController.handle({
      body: pet,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual(pet);
    expect(statusCode).toBe(201);
  });

  it("should not be able create pet because not exists a body", async () => {
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

  it("should not be able create pet because missing header authorization", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const createPetController = new CreatePetController(
      inMemoryPetRepository,
      inMemoryGetUserByIdRepository
    );

    const { body, statusCode } = await createPetController.handle({
      body: pet,
      headers: {},
    });

    expect(body).toEqual("Bad Request - Missing header: authorization");
    expect(statusCode).toBe(400);
  });

  it("should not be able create pet because missing field", async () => {
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
        owner: user,
      } as Pet,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Bad Request - Missing field: age");
    expect(statusCode).toBe(400);
  });

  it("should not be able create pet because invalid field", async () => {
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
        owner: user,
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
      body: pet,
      headers: {
        authorization: `Bearer ${token}1`,
      },
    });

    expect(body).toEqual("Unauthorized - Invalid token");
    expect(statusCode).toBe(401);
  });

  it("should not be able create pet because occured internal error", async () => {
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
      body: pet,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Internal Server Error");
    expect(statusCode).toBe(500);
  });

  it("should not be able create pet because not exists a user", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryGetUserByIdRepository = new InMemoryGetUserByIdRepository();
    const createPetController = new CreatePetController(
      inMemoryPetRepository,
      inMemoryGetUserByIdRepository
    );

    await inMemoryUserRepository.delete(user.id);

    const { body, statusCode } = await createPetController.handle({
      body: pet,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(body).toEqual("Bad Request - User not found");
    expect(statusCode).toBe(400);
  });
});
