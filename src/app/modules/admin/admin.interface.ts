import { RentalStatus, UserStatus } from "../../../../generated/prisma/enums";

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

export type TAdminGearQuery = {
  page?: string;
  limit?: string;
  searchTerm?: string;
  categoryId?: string;
  providerId?: string;
  isAvailable?: string;
};

export type TAdminRentalQuery = {
  page?: string;
  limit?: string;
  status?: RentalStatus;
};
