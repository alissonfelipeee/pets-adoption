import validator from "validator";
import { User } from "../../../models/User";
import { HttpRequest, HttpResponse, IController } from "../../protocols";
import { CreateUserParams, ICreateUserRepository } from "./protocols";
import { generateHash } from "../../../utils/bcrypt";
import { IGetUserByEmailRepository } from "../../../services/get-user-by-email/protocols";
import { badRequest, created, serverError } from "../../utils";

export class CreateUserController implements IController {
  constructor(
    private readonly createUserRepository: ICreateUserRepository,
    private readonly getUserByEmailRepository: IGetUserByEmailRepository
  ) {}

  async handle(
    httpRequest: HttpRequest<CreateUserParams>
  ): Promise<HttpResponse<User | string>> {
    try {
      const { body } = httpRequest;

      if (!body) {
        return badRequest("Bad Request - Missing body");
      }

      const requiredFields = [
        "firstName",
        "lastName",
        "email",
        "password",
        "phone",
      ];

      for (const field of requiredFields) {
        if (!body.hasOwnProperty(field)) {
          return badRequest(`Bad Request - Missing field: ${field}`);
        }
      }

      for (const field of requiredFields) {
        if (body[field as keyof CreateUserParams] === "") {
          return badRequest(`Bad Request - Invalid ${field}`);
        }
      }

      const emailIsValid = validator.isEmail(httpRequest.body!.email);

      if (!emailIsValid) {
        return badRequest("Bad Request - Invalid email");
      }

      const emailAlreadyExists =
        await this.getUserByEmailRepository.getUserByEmail(body.email);

      if (emailAlreadyExists) {
        return badRequest("Bad Request - Email already exists");
      }

      const user = await this.createUserRepository.createUser({
        ...body,
        password: await generateHash(body.password),
      });

      const { password, createdAt, updatedAt, ...userWithoutPassword } = user;

      return created<User>(userWithoutPassword);
    } catch (error) {
      return serverError();
    }
  }
}
