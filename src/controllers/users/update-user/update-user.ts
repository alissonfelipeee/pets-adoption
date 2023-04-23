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

      if (!id) {
        return badRequest("Bad Request - Missing param: id");
      }

      if (!authorization) {
        return badRequest("Bad Request - Missing header: authorization");
      }

      if (!httpRequest.body) {
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
      const someFieldIsNotAllowedToUpdate = Object.keys(httpRequest.body).some(
        (key) => !allowedFieldsToUpdate.includes(key as keyof UpdateUserParams)
      );

      if (someFieldIsNotAllowedToUpdate) {
        return badRequest("Bad Request - Invalid fields");
      }

      if (httpRequest.body.password) {
        httpRequest.body.password = await generateHash(
          httpRequest.body.password
        );
      }

      const user = await this.updateUserRepository.updateUser(
        id,
        httpRequest.body
      );

      excludeFieldsUser(user, ["password", "createdAt", "updatedAt"]);

      return ok<User>(user);
    } catch (error) {
      return serverError();
    }
  }
}
