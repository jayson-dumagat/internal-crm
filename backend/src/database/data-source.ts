import "reflect-metadata";

import { DataSource } from "typeorm";

import { env } from "../config/env";
import { entities } from "./entities";

export const AppDataSource = new DataSource({
  type: "postgres",

  url: env.DATABASE_URL,

  synchronize: false,

  logging: env.NODE_ENV === "development",

  entities,

  migrations: [
    "dist/database/migrations/*.js",
  ],

  subscribers: [],

  migrationsTableName: "migrations",
});