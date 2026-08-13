import morgan from "morgan";

import { createLogger } from "../shared/utils/logger";

const httpLogger = createLogger("http");

export const morganMiddleware = morgan("combined", {
  stream: {
    write: (message: string) => {
      httpLogger.http(message.trim());
    },
  },
});