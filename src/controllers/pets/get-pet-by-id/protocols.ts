import { Pet } from "../../../models/Pet";

export interface IGetPetByIdRepository {
  getPetById(id: number): Promise<Pet>;
}
