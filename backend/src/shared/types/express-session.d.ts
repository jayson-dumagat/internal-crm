import "express-session";

import type { EntraUser } from "../../modules/auth/auth.types";

declare module "express-session" {
  interface SessionData {
    entraAuth?: {
      state: string;
      codeVerifier: string;
      createdAt: number;
    };

    user?: EntraUser;
  }
}

export {};