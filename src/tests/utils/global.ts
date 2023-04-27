import { Pet } from "../../models/Pet";
import { User } from "../../models/User";

export const userExample = {
  id: 1,
  firstName: "John",
  lastName: "Doe",
  email: "johndoe@gmail.com",
  password: "123456",
  phone: "(61) 90000-0000",
} as User;

export const petExample = {
  id: 1,
  name: "Dog",
  age: 1,
  breed: "Pitbull",
  owner: userExample,
  available: true,
} as Pet;
