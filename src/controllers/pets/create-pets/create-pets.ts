import { IGetUserByIdRepository } from "../../../services/get-user-by-id/protocols";
import { HttpRequest, HttpResponse, IController } from "../../protocols";
import { CreatePetsParams, ICreatePetsRepository } from "./protocols";
import { badRequest, created, serverError } from "../../utils";
import { verifyToken } from "../../../utils/verifyToken";
import { Pet } from "../../../models/Pet";

export class CreatePetController implements IController {
  constructor(
    private readonly createPetRepository: ICreatePetsRepository,
    private readonly getUserByIdRepository: IGetUserByIdRepository
  ) {}

  async handle(
    httpRequest: HttpRequest<CreatePetsParams>
  ): Promise<HttpResponse<Pet | string>> {
    try {
      const { authorization } = httpRequest.headers;

      if (!httpRequest.body) {
        return badRequest("Bad Request - Missing body");
      }

      if (!authorization) {
        return badRequest("Bad Request - Missing header: authorization");
      }

      const requiredFields = ["name", "age", "breed"];

      for (const field of requiredFields) {
        if (!httpRequest.body.hasOwnProperty(field)) {
          return badRequest(`Bad Request - Missing field: ${field}`);
        }
      }

      for (const field of requiredFields) {
        if (httpRequest.body[field as keyof CreatePetsParams] === "") {
          return badRequest(`Bad Request - Invalid ${field}`);
        }
      }

      const verifyUserToken = verifyToken(authorization);

      if (!verifyUserToken) {
        return badRequest("Bad Request - Invalid token");
      }

      const owner = await this.getUserByIdRepository.getUserById(
        verifyUserToken.id
      );

      if (!owner) {
        return badRequest("Bad Request - Invalid token");
      }

      httpRequest.body.owner = owner;

      const pet = await this.createPetRepository.createPet({
        ...httpRequest.body,
      });

      return created<Pet>(pet);
    } catch (error) {
      return serverError();
    }
  }
}