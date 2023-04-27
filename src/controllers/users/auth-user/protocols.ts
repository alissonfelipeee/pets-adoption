export interface AuthUserResponse {
  email: string;
  token: string;
}

export interface AuthUserParams {
  email: string;
  password: string;
}

export interface IAuthUserRepository {
  auth(params: AuthUserParams): Promise<AuthUserResponse | undefined>;
}
