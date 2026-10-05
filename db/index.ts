import { drizzle } from "drizzle-orm/netlify-db";
import { getDatabase } from "@netlify/database";
import * as schema from "./schema.js";

function createDatabase() {
  return drizzle({ client: getDatabase(), schema });
}

let client: ReturnType<typeof createDatabase> | undefined;

export function database() {
  return client ??= createDatabase();
}
