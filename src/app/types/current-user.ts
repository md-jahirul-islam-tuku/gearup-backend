import { Role } from "../../../generated/prisma/enums";

export type TCurrentUser = {
  userId: string;
  email: string;
  role: Role;
};
