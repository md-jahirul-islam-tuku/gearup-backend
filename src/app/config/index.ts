import dotenv from "dotenv";

dotenv.config();

export default {
  node_env: process.env.NODE_ENV || "development",
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  app_url: process.env.APP_URL,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN!,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN!,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  stripe_secret_key: process.env.STRIPE_SECRET_KEY!,
  stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
};
