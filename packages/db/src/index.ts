import { env } from "@uni-perks/env/server";
import { drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";

export const db = drizzle(env.DB, { schema });
export * from "./schema";
export { eq, and, or, not, desc, asc, inArray, isNull, isNotNull, like, ilike, sql } from "drizzle-orm";
