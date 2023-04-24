import { Pet } from "../../../models/Pet";

export interface UpdatePetParams {
  name?: string;
  age?: number;
  breed?: string;
  available?: boolean;
}

export interface IUpdatePetRepository {
  updatePet(id: number, pamars: UpdatePetParams): Promise<Pet>;
}
