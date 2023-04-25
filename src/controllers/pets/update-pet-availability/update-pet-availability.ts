import { Pet } from "../../../models/Pet";
import { excludeFieldsUser } from "../../../utils/excludeFieldsPrisma";
import { verifyToken } from "../../../utils/verifyToken";
import { HttpRequest, HttpResponse, IController } from "../../protocols";
import {
  badRequest,
  notFound,
  ok,
  serverError,
  unauthorized,
} from "../../utils";
import { IGetPetByIdRepository } from "../get-pet-by-id/protocols";
import { IUpdatePetAvailabilityRepository } from "./protocolts";

export class UpdatePetAvailabilityController implements IController {
  constructor(
    private readonly UpdatePetAvailabilityRepository: IUpdatePetAvailabilityRepository,
    private readonly getPetByIdRepository: IGetPetByIdRepository
  ) {}
  async handle(
    httpRequest: HttpRequest<any>
  ): Promise<HttpResponse<Pet | string>> {
    try {
      const { id } = httpRequest.params;

      const { authorization } = httpRequest.headers;

      if (!id) {
        return badRequest("Bad Request - Missing param: id");
      }

      if (!authorization) {
        return unauthorized("Unauthorized - Missing header: authorization");
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
        return unauthorized("Unauthorized - Invalid token for this user");
      }

      const pet =
        await this.UpdatePetAvailabilityRepository.updatePetAvailability(id);

      excludeFieldsUser(pet.owner, ["password", "createdAt", "updatedAt"]);

      return ok<Pet>(pet);
    } catch (error) {
      return serverError();
    }
  }
}
