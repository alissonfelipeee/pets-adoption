import { Pet } from "../../../models/Pet";

export interface IUpdatePetAvailabilityRepository {
  updatePetAvailability(id: number): Promise<Pet>;
}
