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
import { IUpdatePetRepository, UpdatePetParams } from "./protocols";

export class UpdatePetController implements IController {
  constructor(
    private readonly updatePetRepository: IUpdatePetRepository,
    private readonly getPetByIdRepository: IGetPetByIdRepository
  ) {}
  async handle(
    httpRequest: HttpRequest<UpdatePetParams>
  ): Promise<HttpResponse<Pet | string>> {
    try {
      const { id } = httpRequest.params;

      const { authorization } = httpRequest.headers;

      const { body } = httpRequest;

      if (!id) {
        return badRequest("Bad Request - Missing param: id");
      }

      if (!authorization) {
        return badRequest("Bad Request - Missing header: authorization");
      }

      if (!body) {
        return badRequest("Bad Request - Missing body");
      }

      if (Object.keys(body).length === 0) {
        return badRequest("Bad Request - Empty body");
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

      const allowedFieldsToUpdate: (keyof UpdatePetParams)[] = [
        "name",
        "age",
        "breed",
        "available",
      ];
      const someFieldIsNotAllowedToUpdate = Object.keys(body).some(
        (key) => !allowedFieldsToUpdate.includes(key as keyof UpdatePetParams)
      );

      if (someFieldIsNotAllowedToUpdate) {
        return badRequest("Bad Request - Invalid fields");
      }

      const pet = await this.updatePetRepository.updatePet(+id, body);

      excludeFieldsUser(pet.owner, ["password", "createdAt", "updatedAt"]);

      return ok<Pet>(pet);
    } catch (error) {
      return serverError();
    }
  }
}
