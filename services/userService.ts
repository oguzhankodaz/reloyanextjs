// services/userService.ts
import { getUserByIdAction } from "@/actions/users";

export async function fetchUser(userId: string) {
  return await getUserByIdAction(userId);
}
