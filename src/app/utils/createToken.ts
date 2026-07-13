// import jwt, { Secret, SignOptions } from "jsonwebtoken";

// const createToken = (
//   jwtPayload: object,
//   secret: Secret,
//   expiresIn: SignOptions,
// ) => {
//   return jwt.sign(jwtPayload, secret, {
//     expiresIn,
//   } as SignOptions);
// };

// export default createToken;

import jwt,{ SignOptions, Secret } from "jsonwebtoken";

export const createToken = (
  payload: object,
  secret: Secret,
  expiresIn: SignOptions["expiresIn"],
) => {
  return jwt.sign(payload, secret, { expiresIn });
};
