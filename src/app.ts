import { User } from "@prisma/client";

declare global {
  namespace Express {
    interface request {
      user?: User;
    }
  }
}
