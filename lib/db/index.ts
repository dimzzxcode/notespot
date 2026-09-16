import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function getConnectionString(): string {
  return process.env.DATABASE_URL ?? "postgres://user:password@localhost:5432/notespot";
}

const connectionString = getConnectionString();

const client = postgres(connectionString, { prepare: false, max: 1 });

export const db = drizzle(client, { schema });

export * from "./schema";
