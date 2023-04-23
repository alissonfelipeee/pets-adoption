import { Pet } from "../../../models/Pet";
import { User } from "../../../models/User";

export interface CreatePetsParams {
  name: string;
  age: number;
  breed: string;
  owner: User;
}

export interface ICreatePetsRepository {
  createPet(params: CreatePetsParams): Promise<Pet>;
}
