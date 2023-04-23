import { Pet } from "../../../models/Pet";

export interface IGetPetsRepository {
  getPets(): Promise<Pet[]>;
}
