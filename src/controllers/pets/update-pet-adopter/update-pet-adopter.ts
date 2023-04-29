import { Pet } from "../../../models/Pet";
import { IGetUserByIdRepository } from "../../../services/get-user-by-id/protocols";
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
import { IUpdatePetAdopterRepository } from "./protocolts";

export class UpdatePetAdopterController implements IController {
  constructor(
    private readonly UpdatePetAdopteryRepository: IUpdatePetAdopterRepository,
    private readonly getUserByIdRepository: IGetUserByIdRepository,
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
        return badRequest("Bad Request - Missing header: authorization");
      }

      const petExists = await this.getPetByIdRepository.getPetById(+id);

      if (!petExists) {
        return notFound("Not found - Pet not found");
      }

      if (!petExists.available) {
        return badRequest("Bad Request - Pet not available");
      }

      const verifyUserToken = verifyToken(authorization);

      if (!verifyUserToken) {
        return unauthorized("Unauthorized - Invalid token");
      }

      if (verifyUserToken.id == petExists.owner.id) {
        return badRequest("Bad Request - You are the owner of this pet");
      }

      const userAdopter = await this.getUserByIdRepository.getUserById(
        verifyUserToken.id
      );

      const pet = await this.UpdatePetAdopteryRepository.updatePetAdopter(
        +id,
        userAdopter
      );

      excludeFieldsUser(pet.owner, ["password", "createdAt", "updatedAt"]);
      if (pet.adopter) {
        excludeFieldsUser(pet.adopter, ["password", "createdAt", "updatedAt"]);
      }

      return ok<Pet>(pet);
    } catch (error) {
      return serverError();
    }
  }
}
