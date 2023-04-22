import validator from "validator";
import { User } from "../../models/user";
import { HttpRequest, HttpResponse, IController } from "../protocols";
import { CreateUserParams, ICreateUserRepository } from "./protocols";
import { generateHash } from "../../utils/bcrypt";
import { IEmailAlreadyExistsRepository } from "../../services/email-already-exists/protocols";
import { badRequest, created, serverError } from "../utils";

export class CreateUserController implements IController {
  constructor(
    private readonly createUserRepository: ICreateUserRepository,
    private readonly verifyEmailAlreadyExists: IEmailAlreadyExistsRepository
  ) {}

  async handle(
    httpRequest: HttpRequest<CreateUserParams>
  ): Promise<HttpResponse<User | string>> {
    try {
      if (!httpRequest.body) {
        return badRequest("Bad Request - Missing body");
      }

      const requiredFields = ["firstName", "lastName", "email", "password"];

      for (const field of requiredFields) {
        if (!httpRequest.body.hasOwnProperty(field)) {
          return badRequest(`Bad Request - Missing field: ${field}`);
        }
      }

      for (const field of requiredFields) {
        if (httpRequest.body[field as keyof CreateUserParams] === "") {
          return badRequest(`Bad Request - Invalid ${field}`);
        }
      }

      const emailIsValid = validator.isEmail(httpRequest.body!.email);

      if (!emailIsValid) {
        return badRequest("Bad Request - Invalid email");
      }

      const emailAlreadyExists =
        await this.verifyEmailAlreadyExists.emailAlreadyExists(
          httpRequest.body.email
        );

      if (emailAlreadyExists) {
        return badRequest("Bad Request - Email already exists");
      }

      const user = await this.createUserRepository.createUser({
        ...httpRequest.body,
        password: await generateHash(httpRequest.body.password),
      });

      const { password, ...userWithoutPassword } = user;

      return created<User>(userWithoutPassword);
    } catch (error) {
      return serverError();
    }
  }
}
