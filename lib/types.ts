import { User, UserPoints } from "@prisma/client";

export type ActionResponse = {
    success: boolean;
    message: string;
  };

  export type CompanyCustomer = UserPoints & {
    user: Pick<User, "id" | "name" | "surname" | "email">;
  };
  