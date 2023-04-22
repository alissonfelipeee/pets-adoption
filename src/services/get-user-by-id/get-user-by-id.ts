import { User } from "../../models/user";
import { IGetUserByIdRepository } from "./protocols";

export class GetUserByIdService {
  constructor(private readonly getUserByIdRepository: IGetUserByIdRepository) {}

  async execute(id: number): Promise<User> {
    return await this.getUserByIdRepository.getUserById(id);
  }
}
