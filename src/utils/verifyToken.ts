import jwt from "jsonwebtoken";

type JwtPayload = {
  id: number;
};

export const verifyToken = (token: string) => {
  try {
    const tokenSplited = token.split(" ");
    const tokenWithoutBearer = tokenSplited[1];

    return jwt.verify(tokenWithoutBearer, "secret") as JwtPayload;
  } catch (error) {
    return false;
  }
};
