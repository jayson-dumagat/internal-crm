import "express-session";

import type { EntraUser } from "../../modules/auth/auth.types";
import type { AccessPolicySnapshot } from "../../modules/access/access-control";

declare global {
  namespace Express {
    interface Request {
      accessPolicy?: AccessPolicySnapshot;
    }
  }
}

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
