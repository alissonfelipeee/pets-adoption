import { User } from "../../../models/User";
import { generateHash } from "../../../utils/bcrypt";
import { excludeFieldsUser } from "../../../utils/excludeFieldsPrisma";
import { verifyToken } from "../../../utils/verifyToken";
import { HttpRequest, HttpResponse, IController } from "../../protocols";
import { badRequest, ok, serverError, unauthorized } from "../../utils";
import { IUpdateUserRepository, UpdateUserParams } from "./protocols";

export class UpdateUserController implements IController {
  constructor(private readonly updateUserRepository: IUpdateUserRepository) {}
  async handle(
    httpRequest: HttpRequest<UpdateUserParams>
  ): Promise<HttpResponse<User | string>> {
    try {
      const { id } = httpRequest.params;

      const { authorization } = httpRequest.headers;

      const { body } = httpRequest;

      if (!id) {
        return badRequest("Bad Request - Missing param: id");
      }

      if (!authorization) {
        return badRequest("Bad Request - Missing header: authorization");
      }

      if (!body) {
        return badRequest("Bad Request - Missing body");
      }

      const verifyUserToken = verifyToken(authorization);

      if (!verifyUserToken) {
        return unauthorized("Unauthorized - Invalid token");
      }

      if (verifyUserToken.id !== Number(id)) {
        return unauthorized("Unauthorized - Invalid token for this user");
      }

      const allowedFieldsToUpdate: (keyof UpdateUserParams)[] = [
        "firstName",
        "lastName",
        "password",
        "phone",
      ];
      const someFieldIsNotAllowedToUpdate = Object.keys(body).some(
        (key) => !allowedFieldsToUpdate.includes(key as keyof UpdateUserParams)
      );

      if (someFieldIsNotAllowedToUpdate) {
        return badRequest("Bad Request - Invalid fields");
      }

      if (body.password) {
        body.password = await generateHash(body.password);
      }

      const user = await this.updateUserRepository.updateUser(id, body);

      excludeFieldsUser(user, ["password", "createdAt", "updatedAt"]);

      return ok<User>(user);
    } catch (error) {
      return serverError();
    }
  }
}
