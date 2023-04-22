import { User } from "../../models/user";
import { HttpResponse, IController } from "../protocols";
import { ok, serverError } from "../utils";
import { IGetUsersRepository } from "./protocols";
export class GetUsersController implements IController {
  constructor(private readonly getUsersRepository: IGetUsersRepository) {}

  async handle(): Promise<HttpResponse<User[] | string>> {
    try {
      const users = await this.getUsersRepository.getUsers();

      const usersWithoutPassword = users.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }) as User[];

      return ok<User[]>(usersWithoutPassword);
    } catch (error) {
      return serverError();
    }
  }
}
