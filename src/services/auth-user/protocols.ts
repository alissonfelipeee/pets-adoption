import { AuthUserResponse } from "../../controllers/users/auth-user/protocols";

export interface IAuthUserService {
  authUser(email: string, password: string): Promise<AuthUserResponse | undefined>;
}
