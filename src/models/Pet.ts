import { User } from "./User";

export interface Pet {
  id: number;
  name: string;
  age: number;
  breed: string;
  owner: User;
  available: boolean;
  adopter?: User;
  createdAt: Date;
  updatedAt: Date;
}
