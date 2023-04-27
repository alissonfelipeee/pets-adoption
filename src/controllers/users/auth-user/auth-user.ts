import { IAuthUserService } from "../../../services/auth-user/protocols";
import { HttpRequest, HttpResponse } from "../../protocols";
import { badRequest, serverError, unauthorized } from "../../utils";
import { AuthUserParams, AuthUserResponse } from "./protocols";

export class AuthUserController {
  constructor(private readonly authUserService: IAuthUserService) {}

  async handle(
    httpRequest: HttpRequest<AuthUserParams>
  ): Promise<HttpResponse<AuthUserResponse | string>> {
    try {
      const body = httpRequest.body;

      if (!body) {
        return badRequest("Bad Request - Missing body");
      }

      const { email, password } = body;

      if (!email) {
        return badRequest("Bad Request - Missing param: email");
      }

      if (!password) {
        return badRequest("Bad Request - Missing param: password");
      }

      const authUser = await this.authUserService.authUser(email, password);

      if (!authUser) {
        return unauthorized("Unauthorized - Invalid credentials");
      }

      return {
        statusCode: 200,
        body: authUser,
      };
    } catch (error) {
      return serverError();
    }
  }
}
