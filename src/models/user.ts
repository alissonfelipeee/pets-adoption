import { Pet } from "./Pet";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  pets?: Pet[];
  adoptions?: Pet[];
  createdAt: Date;
  updatedAt: Date;
}
