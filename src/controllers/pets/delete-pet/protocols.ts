import { Pet } from "../../../models/Pet";

export interface IDeletePetRepository {
  delete(id: number): Promise<Pet>;
}
