import { IGetUserByIdRepository } from "../../../services/get-user-by-id/protocols";
import { HttpRequest, HttpResponse, IController } from "../../protocols";
import { CreatePetsParams, ICreatePetsRepository } from "./protocols";
import { badRequest, created, serverError, unauthorized } from "../../utils";
import { verifyToken } from "../../../utils/verifyToken";
import { Pet } from "../../../models/Pet";
import { excludeFieldsUser } from "../../../utils/excludeFieldsPrisma";

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
          return badRequest(`Bad Request - Invalid field: ${field}`);
        }
      }

      const verifyUserToken = verifyToken(authorization);

      if (!verifyUserToken) {
        return unauthorized("Unauthorized - Invalid token");
      }

      const owner = await this.getUserByIdRepository.getUserById(
        verifyUserToken.id
      );

      if (!owner) {
        return badRequest("Bad Request - User not found");
      }

      httpRequest.body.owner = owner;

      const pet = await this.createPetRepository.createPet({
        ...httpRequest.body,
      });

      excludeFieldsUser(pet.owner, ["password", "createdAt", "updatedAt"]);

      return created<Pet>(pet);
    } catch (error) {
      return serverError();
    }
  }
}
