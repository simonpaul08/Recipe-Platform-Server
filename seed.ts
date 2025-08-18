import { db, users, recipes, ratings, savedRecipes } from "./db/db.js";
import { hashPassword } from "./utils/hash.js";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Clear tables
  await db.delete(savedRecipes);
  await db.delete(ratings);
  await db.delete(recipes);
  await db.delete(users);

  // Users
  const alicePw = await hashPassword("password123");
  const bobPw = await hashPassword("password123");

  const [alice] = await db
    .insert(users)
    .values({ name: "Alice", email: "alice@example.com", passwordHash: alicePw })
    .returning({ id: users.id });

  const [bob] = await db
    .insert(users)
    .values({ name: "Bob", email: "bob@example.com", passwordHash: bobPw })
    .returning({ id: users.id });

  // Recipes
  const [pasta] = await db
    .insert(recipes)
    .values({
      title: "Pasta Arrabiata",
      description: "Spicy Italian pasta",
      imageUrl: null,
      ingredients: JSON.stringify(["pasta", "tomatoes", "garlic", "chili flakes"]),
      instructions: JSON.stringify(["Boil pasta", "Make sauce", "Mix and serve"]),
      authorId: alice?.id,
      createdAt: sql`(strftime('%s','now'))`,
      updatedAt: sql`(strftime('%s','now'))`,
    })
    .returning({ id: recipes.id });

  const [chicken] = await db
    .insert(recipes)
    .values({
      title: "Butter Chicken",
      description: "Creamy Indian curry",
      imageUrl: null,
      ingredients: JSON.stringify(["chicken", "butter", "cream", "spices"]),
      instructions: JSON.stringify(["Cook chicken", "Make curry", "Mix and serve"]),
      authorId: bob?.id,
      createdAt: sql`(strftime('%s','now'))`,
      updatedAt: sql`(strftime('%s','now'))`,
    })
    .returning({ id: recipes.id });

  // Ratings
  await db.insert(ratings).values([
    { userId: alice?.id, recipeId: chicken?.id, rating: 5, createdAt: sql`(strftime('%s','now'))`, updatedAt: sql`(strftime('%s','now'))` },
    { userId: bob?.id, recipeId: pasta?.id, rating: 4, createdAt: sql`(strftime('%s','now'))`, updatedAt: sql`(strftime('%s','now'))` },
  ]);

  // Saved Recipes
  await db.insert(savedRecipes).values([
    { userId: alice?.id, recipeId: chicken?.id, createdAt: sql`(strftime('%s','now'))`, updatedAt: sql`(strftime('%s','now'))` },
    { userId: bob?.id, recipeId: pasta?.id, createdAt: sql`(strftime('%s','now'))`, updatedAt: sql`(strftime('%s','now'))` },
  ]);

  console.log("Seeding completed!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed: ", err);
    process.exit(1);
  });
