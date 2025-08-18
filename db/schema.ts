import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

// USERS
export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .default(sql`(strftime('%s','now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
        .default(sql`(strftime('%s','now'))`)
});

// RECIPES
export const recipes = sqliteTable("recipes", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    ingredients: text("ingredients").notNull(),
    instructions: text("instructions").notNull(),
    authorId: integer("author_id").references(() => users.id),
    averageRating: real("average_rating").default(0),
    totalRatings: integer("total_ratings").default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .default(sql`(strftime('%s','now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
        .default(sql`(strftime('%s','now'))`)
});

// RATINGS
export const ratings = sqliteTable("ratings", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").references(() => users.id),
    recipeId: integer("recipe_id").references(() => recipes.id),
    rating: integer("rating").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .default(sql`(strftime('%s','now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
        .default(sql`(strftime('%s','now'))`)
});

// SAVED RECIPES (Bookmarks)
export const savedRecipes = sqliteTable("saved_recipes", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").references(() => users.id),
    recipeId: integer("recipe_id").references(() => recipes.id),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .default(sql`(strftime('%s','now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
        .default(sql`(strftime('%s','now'))`)
});