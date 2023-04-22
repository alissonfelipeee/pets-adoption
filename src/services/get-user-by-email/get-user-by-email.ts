import { User } from "../../models/User";
import { IGetUserByEmailRepository } from "./protocols";

export class GetUserByEmailService {
  constructor(
    private readonly getUserByEmailRepository: IGetUserByEmailRepository
  ) {}

  async execute(email: string): Promise<User | undefined> {
    return await this.getUserByEmailRepository.getUserByEmail(email);
  }
}
