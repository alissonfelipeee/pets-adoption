export interface IEmailAlreadyExistsRepository {
  emailAlreadyExists(email: string): Promise<boolean>;
}