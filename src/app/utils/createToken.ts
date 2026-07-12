import jwt, { Secret, SignOptions } from "jsonwebtoken";

const createToken = (
  jwtPayload: object,
  secret: Secret,
  expiresIn: SignOptions,
) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn,
  } as SignOptions);
};

export default createToken;
