import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { env } from "../config.js"; 
import * as schema from "./schema.js";

// Initialize SQLite database
const sqlite = new Database(env.DATABASE_URL);

export const db = drizzle(sqlite, { schema });

export const { users, recipes, ratings, savedRecipes } = schema;
