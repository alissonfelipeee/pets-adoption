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
