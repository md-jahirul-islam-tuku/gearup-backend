import { UserStatus } from "../../../../generated/prisma/enums";
import { z } from "zod";

export const updateUserStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum([UserStatus.ACTIVE, UserStatus.SUSPENDED]),
  }),
});
