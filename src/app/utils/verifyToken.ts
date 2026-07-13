import jwt, { JwtPayload, Secret } from "jsonwebtoken";

const verifyToken = (token: string, secret: Secret): string | JwtPayload => {
  return jwt.verify(token, secret);
};

export default verifyToken;
