import { Pet } from "../../../models/Pet";

export interface IRemovePetAdopterRepository {
  removePetAdopter(id: number): Promise<Pet>;
}
