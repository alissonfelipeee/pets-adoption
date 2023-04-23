import { AuthUserResponse } from "../../controllers/users/auth-user/protocols";
import { compareHash } from "../../utils/bcrypt";
import { generateToken } from "../../utils/generateToken";
import { IGetUserByEmailRepository } from "../get-user-by-email/protocols";

export class AuthUserService {
  constructor(
    private readonly getUserByEmailRepository: IGetUserByEmailRepository
  ) {}

  async authUser(email: string, password: string): Promise<AuthUserResponse | undefined> {
    const user = await this.getUserByEmailRepository.getUserByEmail(email);

    if (!user) {
      return
    }

    const isPasswordCorrect = await compareHash(password, user.password);

    if (!isPasswordCorrect) {
      return
    }

    const token = generateToken(user.id, user.email);

    return {
      email: user.email,
      token,
    }
  }
}
