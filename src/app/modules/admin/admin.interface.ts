import { UserStatus } from "../../../../generated/prisma/enums";

export type TAdminQuery = {
  page?: string;
  limit?: string;
  searchTerm?: string;
  role?: string;
  status?: UserStatus;
};

export type TUpdateUserStatus = {
  status: UserStatus;
};
