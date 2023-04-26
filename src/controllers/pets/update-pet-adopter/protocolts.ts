import { Pet } from "../../../models/Pet";
import { User } from "../../../models/User";

export interface IUpdatePetAdopterRepository {
  updatePetAdopter(id: number, adopter: User): Promise<Pet>;
}
