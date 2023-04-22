import { IAuthUserService } from "../../../services/auth-user/protocols";
import { IGetUserByEmailRepository } from "../../../services/get-user-by-email/protocols";
import { HttpRequest, HttpResponse } from "../../protocols";
import { badRequest, serverError, unauthorized } from "../../utils";
import {
  AuthUserParams,
  AuthUserResponse,
} from "./protocols";

export class AuthUserController {
  constructor(
    private readonly authUserService: IAuthUserService,
  ) {}

  async handle(
    httpRequest: HttpRequest<AuthUserParams>
  ): Promise<HttpResponse<AuthUserResponse | string>> {
    try {
      const body = httpRequest.body;

      if (!body) {
        return badRequest("Missing body");
      }

      const { email, password } = body;

      if (!email) {
        return badRequest("Missing param: email");
      }

      if (!password) {
        return badRequest("Missing param: password");
      }

      const authUser = await this.authUserService.authUser(email, password);

      if (!authUser) {
        return unauthorized("Invalid credentials");
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