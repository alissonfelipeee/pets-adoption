import { HttpRequest } from "./../../protocols";
import { Pet } from "../../../models/Pet";
import { excludeFieldsUser } from "../../../utils/excludeFieldsPrisma";
import { HttpResponse, IController } from "../../protocols";
import { badRequest, notFound, ok, serverError } from "../../utils";
import { IGetPetByIdRepository } from "./protocols";

export class GetPetByIdController implements IController {
  constructor(private readonly getPetByIdRepository: IGetPetByIdRepository) {}

  async handle(
    httpRequest: HttpRequest<any>
  ): Promise<HttpResponse<Pet | string>> {
    try {
      const { id } = httpRequest.params;

      if (!id) {
        return badRequest("Bad Request - Missing param: id");
      }

      const pet = await this.getPetByIdRepository.getPetById(+id);

      if (!pet) {
        return notFound("Not found - Pet not found");
      }

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
