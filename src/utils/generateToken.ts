import jwt from "jsonwebtoken";

export const generateToken = (id: number, email: string) => {
  const token = jwt.sign(
    {
      id,
      email,
    },
    "secret",
    {
      expiresIn: "3d",
    }
  );

  return token;
};
