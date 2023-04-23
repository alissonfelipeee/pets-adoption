import { Pet } from "../../../models/Pet";
import { HttpResponse, IController } from "../../protocols";
import { ok, serverError } from "../../utils";
import { IGetPetsRepository } from "./protocols";
export class GetPetsController implements IController {
  constructor(private readonly getPetsRepository: IGetPetsRepository) {}

  async handle(): Promise<HttpResponse<Pet[] | string>> {
    try {
      const pets = await this.getPetsRepository.getPets();

      return ok<Pet[]>(pets);
    } catch (error) {
      return serverError();
    }
  }
}
