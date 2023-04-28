import { UpdateUserParams } from "../../controllers/users/update-user/protocols";
import { Pet } from "../../models/Pet";
import { User } from "../../models/User";

const users: User[] = [];
const pets: Pet[] = [];

export class InMemoryUserRepository {
  private users: User[] = users;

  async getUsers(): Promise<User[]> {
    return this.users;
  }

  async createUser(user: User): Promise<User> {
    const newUser = { ...user, id: this.users.length + 1 };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: number, params: UpdateUserParams): Promise<User> {
    const userIndex = this.users.findIndex((user) => user.id === id);
    const user = this.users[userIndex];
    const updatedUser = { ...user, ...params };
    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  async delete(id: number): Promise<User> {
    const userIndex = this.users.findIndex((user) => user.id === id);
    const user = this.users[userIndex];
    this.users.splice(userIndex, 1);
    return user;
  }
}

export class InMemoryGetUserByEmailRepository {
  private users: User[] = users;
  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = this.users.find((user) => user.email === email);
    return user;
  }
}

export class InMemoryGetUserByIdRepository {
  private users: User[] = users;
  async getUserById(id: number): Promise<User> {
    const user = this.users.find((user) => user.id === id) as User;
    return user;
  }
}

export class InMemoryPetRepository {
  private pets: Pet[] = pets;
  async getPets(): Promise<Pet[]> {
    return this.pets;
  }

  async createPet(pet: Pet): Promise<Pet> {
    const newPet = { ...pet, id: this.pets.length + 1 };
    this.pets.push(newPet);
    return newPet;
  }

  async getPetById(id: number): Promise<Pet> {
    const pet = this.pets.find((pet) => pet.id === id) as Pet;
    return pet;
  }

  async updatePet(id: number, params: any): Promise<Pet> {
    const petIndex = this.pets.findIndex((pet) => pet.id === id);
    const pet = this.pets[petIndex];
    const updatedPet = { ...pet, ...params };
    this.pets[petIndex] = updatedPet;
    return updatedPet;
  }

  async delete(id: number): Promise<Pet> {
    const petIndex = this.pets.findIndex((pet) => pet.id === id);
    const pet = this.pets[petIndex];
    this.pets.splice(petIndex, 1);
    return pet;
  }

  async updatePetAdopter(id: number, adopter: User): Promise<Pet> {
    const petIndex = this.pets.findIndex((pet) => pet.id === id);
    const pet = this.pets[petIndex];
    const updatedPet = { ...pet, adopter, available: false };
    this.pets[petIndex] = updatedPet;
    const petWithAdopterId = {
      ...pet,
      adopterId: adopter.id,
    };
    return petWithAdopterId;
  }

  async removePetAdopter(id: number): Promise<Pet> {
    const petIndex = this.pets.findIndex((pet) => pet.id === id);
    const pet = this.pets[petIndex];
    const updatedPet = {
      ...pet,
      adopterId: null,
      available: true,
    };
    delete updatedPet.adopter;
    this.pets[petIndex] = updatedPet;
    return updatedPet;
  }
}

export class InMemoryGetPetByIdRepository {
  private pets: Pet[] = pets;
  async getPetById(id: number): Promise<Pet> {
    const pet = this.pets.find((pet) => pet.id === id) as Pet;
    return pet;
  }
}
