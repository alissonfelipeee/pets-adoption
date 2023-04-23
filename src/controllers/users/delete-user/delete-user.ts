import { User } from "../../../models/User";
import { HttpRequest, HttpResponse, IController } from "../../protocols";
import { IDeleteUserRepository } from "./protocols";
import { IGetUserByIdRepository } from "../../../services/get-user-by-id/protocols";
import {
  badRequest,
  notFound,
  ok,
  serverError,
  unauthorized,
} from "../../utils";
import { verifyToken } from "../../../utils/verifyToken";
import { excludeFieldsUser } from "../../../utils/excludeFieldsPrisma";

export class DeleteUserController implements IController {
  constructor(
    private readonly deleteUserRepository: IDeleteUserRepository,
    private readonly getUserByIdService: IGetUserByIdRepository
  ) {}

  async handle(
    httpRequest: HttpRequest<any>
  ): Promise<HttpResponse<User | string>> {
    try {
      const { id } = httpRequest.params;

      const { authorization } = httpRequest.headers;

      if (!id) {
        return badRequest("Missing param: id");
      }

      if (!authorization) {
        return badRequest("Bad Request - Missing header: authorization");
      }

      const userExists = await this.getUserByIdService.getUserById(+id);

      if (!userExists) {
        return notFound("User not found");
      }

      const verifyUserToken = verifyToken(authorization);

      if (!verifyUserToken) {
        return unauthorized("Unauthorized - Invalid token");
      }

      if (verifyUserToken.id !== Number(id)) {
        return unauthorized("Unauthorized - Invalid token for this user");
      }

      const user = await this.deleteUserRepository.delete(+id);

      excludeFieldsUser(user, ["password", "createdAt", "updatedAt"]);

      return ok<User>(user);
    } catch (error) {
      return serverError();
    }
  }
}
