import { AuthUserResponse } from "../../controllers/users/auth-user/protocols";
import { compareHash } from "../../utils/bcrypt";
import { IGetUserByEmailRepository } from "../get-user-by-email/protocols";
import jsonwebtoken from "jsonwebtoken";

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

    const token = jsonwebtoken.sign(
      {
        id: user.id,
        email: user.email,
      },
      "secret",
      {
        expiresIn: "1d"
      }
    );

    return {
      email: user.email,
      token,
    }
  }
}
