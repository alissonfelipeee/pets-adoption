import { HttpRequest, HttpResponse, IController } from "../../protocols";
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
import { IRemovePetAdopterRepository } from "./protocols";

export class RemovePetAdopterController implements IController {
  constructor(
    private readonly removePetAdopterRepository: IRemovePetAdopterRepository,
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

      const verifyUserToken = verifyToken(authorization);

      if (!verifyUserToken) {
        return unauthorized("Unauthorized - Invalid token");
      }

      const petExists = await this.getPetByIdRepository.getPetById(+id);

      if (!petExists) {
        return notFound("Not found - Pet not found");
      }

      if (!petExists.adopter) {
        return badRequest("Bad Request - Pet not have adopter");
      }

      if (verifyUserToken.id !== petExists.owner.id) {
        return unauthorized("Unauthorized - You are not the owner of this pet");
      }

      const pet = await this.removePetAdopterRepository.removePetAdopter(+id);

      excludeFieldsUser(pet.owner, ["password", "createdAt", "updatedAt"]);

      return ok<Pet>(pet);
    } catch (error) {
      return serverError();
    }
  }
}
