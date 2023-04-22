import { IEmailAlreadyExistsRepository } from "./protocols";

export class VerifyEmailAlreadyExistsService {
  constructor(
    private readonly emailAlreadyExistsRepository: IEmailAlreadyExistsRepository
  ) {}

  async execute(email: string): Promise<boolean> {
    return await this.emailAlreadyExistsRepository.emailAlreadyExists(email);
  }
}
