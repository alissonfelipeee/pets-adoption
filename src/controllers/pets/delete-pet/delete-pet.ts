import { User } from "../../../models/User";
import { HttpRequest, HttpResponse, IController } from "../../protocols";
import { IDeletePetRepository } from "./protocols";
import { IGetUserByIdRepository } from "../../../services/get-user-by-id/protocols";
import {
  badRequest,
  notFound,
  ok,
  serverError,
  unauthorized,
} from "../../utils";
import { verifyToken } from "../../../utils/verifyToken";
import { excludeFieldsUser } from "../../../utils/excludeFieldsPrisma";
import { Pet } from "../../../models/Pet";
import { IGetPetByIdRepository } from "../get-pet-by-id/protocols";

export class DeletePetController implements IController {
  constructor(
    private readonly deletePetRepository: IDeletePetRepository,
    private readonly getPetByIdRepository: IGetPetByIdRepository
  ) {}

  async handle(
    httpRequest: HttpRequest<any>
  ): Promise<HttpResponse<Pet | string>> {
    try {
      const { id } = httpRequest.params;

      const { authorization } = httpRequest.headers;

      if (!id) {
        return badRequest("Missing param: id");
      }

      if (!authorization) {
        return badRequest("Bad Request - Missing header: authorization");
      }

      const petExists = await this.getPetByIdRepository.getPetById(+id);

      if (!petExists) {
        return notFound("Not found - Pet not found");
      }

      const verifyUserToken = verifyToken(authorization);

      if (!verifyUserToken) {
        return unauthorized("Unauthorized - Invalid token");
      }

      if (verifyUserToken.id !== petExists.owner.id) {
        return unauthorized("Unauthorized - Invalid token for delete this pet");
      }

      const pet = await this.deletePetRepository.delete(+id);

      excludeFieldsUser(pet.owner, ["password", "createdAt", "updatedAt"]);

      return ok<Pet>(pet);
    } catch (error) {
      return serverError();
    }
  }
}
