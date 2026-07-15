import jwt, { SignOptions, Secret } from "jsonwebtoken";

export const createToken = (
  payload: object,
  secret: Secret,
  expiresIn: SignOptions["expiresIn"],
) => {
  return jwt.sign(payload, secret, { expiresIn });
};
