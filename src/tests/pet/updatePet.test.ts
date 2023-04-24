import { CreatePetController } from "../../controllers/pets/create-pets/create-pets";
import { UpdatePetController } from "../../controllers/pets/update-pet/update-pet";
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

describe("Update Pet", () => {
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

  it("should update a pet", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const updatePetController = new UpdatePetController(
      inMemoryPetRepository,
      inMemoryGetPetByIdRepository
    );

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
      ...pet,
      age: 2,
    });
    expect(statusCode).toBe(200);
  });

  it("should not update a pet because missing param id", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const updatePetController = new UpdatePetController(
      inMemoryPetRepository,
      inMemoryGetPetByIdRepository
    );

    const { statusCode, body } = await updatePetController.handle({
      body: {
        age: 2,
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
      params: {},
    });

    expect(body).toBe("Bad Request - Missing param: id");
    expect(statusCode).toBe(400);
  });

  it("should not update a pet because missing header authorization", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const updatePetController = new UpdatePetController(
      inMemoryPetRepository,
      inMemoryGetPetByIdRepository
    );

    const updatedPet = {
      age: 2,
    } as Pet;

    const { statusCode, body } = await updatePetController.handle({
      body: updatedPet,
      headers: {},
      params: {
        id: 1,
      },
    });

    expect(body).toBe("Unauthorized - Missing header: authorization");
    expect(statusCode).toBe(401);
  });

  it("should not update a pet because missing body", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const updatePetController = new UpdatePetController(
      inMemoryPetRepository,
      inMemoryGetPetByIdRepository
    );

    const { statusCode, body } = await updatePetController.handle({
      headers: {
        authorization: `Bearer ${token}`,
      },
      params: {
        id: 1,
      },
    });

    expect(body).toBe("Bad Request - Missing body");
    expect(statusCode).toBe(400);
  });

  it("should not update a pet because body is empty", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const updatePetController = new UpdatePetController(
      inMemoryPetRepository,
      inMemoryGetPetByIdRepository
    );

    const { statusCode, body } = await updatePetController.handle({
      body: {},
      headers: {
        authorization: `Bearer ${token}`,
      },
      params: {
        id: 1,
      },
    });

    expect(body).toBe("Bad Request - Empty body");
    expect(statusCode).toBe(400);
  });

  it("should not update a pet because pet does not exist", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const updatePetController = new UpdatePetController(
      inMemoryPetRepository,
      inMemoryGetPetByIdRepository
    );

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

    expect(body).toBe("Not found - Pet not found");
    expect(statusCode).toBe(404);
  });

  it("should not update a pet because token is invalid", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const updatePetController = new UpdatePetController(
      inMemoryPetRepository,
      inMemoryGetPetByIdRepository
    );

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

    expect(body).toBe("Unauthorized - Invalid token");
    expect(statusCode).toBe(401);
  });

  it("should not update a pet because user is not the owner of the pet", async () => {
    const inMemoryUserRepository = new InMemoryUserRepository();
    const inMemoryGetUserByEmailRepository =
      new InMemoryGetUserByEmailRepository();
    const createUserController = new CreateUserController(
      inMemoryUserRepository,
      inMemoryGetUserByEmailRepository
    );

    // create another user

    await createUserController.handle({
      body: {
        ...user,
        email: "johndoe2@gmail.com",
      },
    });

    const authUserService = new AuthUserService(
      inMemoryGetUserByEmailRepository
    );
    const authUserController = new AuthUserController(authUserService);

    // auth another user

    const responseAuth = await authUserController.handle({
      body: {
        email: "johndoe2@gmail.com",
        password: user.password,
      },
    });

    const newbody = JSON.stringify(responseAuth.body);
    const tokenAnotherUser = JSON.parse(newbody).token;

    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const updatePetController = new UpdatePetController(
      inMemoryPetRepository,
      inMemoryGetPetByIdRepository
    );

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

    expect(body).toBe("Unauthorized - Invalid token for this user");
    expect(statusCode).toBe(401);
  });

  it("should not update a pet because invalid fiels in body", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const updatePetController = new UpdatePetController(
      inMemoryPetRepository,
      inMemoryGetPetByIdRepository
    );

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

    expect(body).toBe("Bad Request - Invalid fields");
    expect(statusCode).toBe(400);
  });

  it("should not update a pet because internal error", async () => {
    const inMemoryPetRepository = new InMemoryPetRepository();
    const inMemoryGetPetByIdRepository = new InMemoryGetPetByIdRepository();
    const updatePetController = new UpdatePetController(
      inMemoryPetRepository,
      inMemoryGetPetByIdRepository
    );

    jest.spyOn(inMemoryPetRepository, "updatePet").mockImplementationOnce(() => {
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

    expect(body).toBe("Internal Server Error");
    expect(statusCode).toBe(500);
  });
});
