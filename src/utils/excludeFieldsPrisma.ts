export const excludeFieldsUser = <User, Key extends keyof User>(
  user: User,
  keys: Key[]
): Omit<User, Key> => {
  for (let key of keys) {
    delete user[key];
  }
  return user;
};

export const excludeDieldsPet = <Pet, Key extends keyof Pet>(
  pet: Pet,
  keys: Key[]
): Omit<Pet, Key> => {
  for (let key of keys) {
    delete pet[key];
  }
  return pet;
};
