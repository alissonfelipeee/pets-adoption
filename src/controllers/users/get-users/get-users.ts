import { User } from "../../../models/User";
import { excludeFieldsUser } from "../../../utils/excludeFieldsPrisma";
import { HttpResponse, IController } from "../../protocols";
import { ok, serverError } from "../../utils";
import { IGetUsersRepository } from "./protocols";
export class GetUsersController implements IController {
  constructor(private readonly getUsersRepository: IGetUsersRepository) {}

  async handle(): Promise<HttpResponse<User[] | string>> {
    try {
      const users = await this.getUsersRepository.getUsers();

      for (const user of users) {
        excludeFieldsUser(user, ["password", "createdAt", "updatedAt"]);
      }

      return ok<User[]>(users);
    } catch (error) {
      return serverError();
    }
  }
}
