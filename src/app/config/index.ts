import dotenv from "dotenv";

dotenv.config();

export default {
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  app_url: process.env.APP_URL,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
};
