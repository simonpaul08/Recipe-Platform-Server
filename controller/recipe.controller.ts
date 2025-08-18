import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { db, ratings, recipes, savedRecipes } from "../db/db.js";
import { and, desc, eq, like, or, sql } from "drizzle-orm";



export const createRecipe = async (req: AuthRequest, res: Response) => {
    const { title, description, ingredients, instructions, imageUrl } = req.body;

    if (!title || !description || !ingredients || !instructions) {
        return res.status(400).json({ message: "required fields are missing" })
    }

    try {
        await db
            .insert(recipes)
            .values({
                title,
                description,
                ingredients: JSON.stringify(ingredients),
                instructions: JSON.stringify(instructions),
                imageUrl: imageUrl ?? ""
            })

        return res.status(201).json({ message: "recipe created successfully" });
    } catch (err) {
        console.error("Error: failed to create recipe", err)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const listRecipes = async (req: AuthRequest, res: Response) => {
    try {
        const { q, page = "1", limit = "10", sort = "latest" } = req.query;

        const pageNum = Math.max(1, parseInt(page as string));
        const limitNum = Math.min(50, parseInt(limit as string));

        const conditions = [];
        if (q && typeof q === "string") {
            conditions.push(
                or(
                    like(recipes.title, `%${q}%`),
                    like(recipes.ingredients, `%${q}%`)
                )
            );
        }

        let orderBy: any[] = [];
        if (sort === "latest") {
            orderBy = [desc(recipes.id)];
        } else if (sort === "top") {
            orderBy = [desc(recipes.averageRating), desc(recipes.totalRatings)];
        }

        const totalResult = await db
            .select({ count: sql<number>`count(*)`.as("count") })
            .from(recipes)
            .where(conditions.length ? conditions[0] : undefined);

        const total = totalResult[0]?.count || 0;
        const totalPages = Math.ceil(total / limitNum);

        const results = await db
            .select()
            .from(recipes)
            .where(conditions.length ? conditions[0] : undefined)
            .orderBy(...orderBy)
            .limit(limitNum)
            .offset((pageNum - 1) * limitNum);

        const data = results.map((r) => ({
            ...r,
            ingredients: JSON.parse(r.ingredients),
            instructions: JSON.parse(r.instructions),
        }));

        res.status(200).json({
            data,
            page: pageNum,
            limit: limitNum,
            total,
            totalPages,
        });
    } catch (err) {
        console.error("Error: failed to list recipes", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const getRecipeById = async (req: AuthRequest, res: Response) => {

    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "id is missing" })
    }

    try {

        const result = await db.select().from(recipes).where(eq(recipes.id, parseInt(id)));
        if (result.length === 0) {
            return res.status(404).json({ message: "recipe does not exists" })
        };

        const recipe = result[0];
        res.status(200).json({
            ...recipe,
            ingredients: JSON.parse(recipe?.ingredients!),
            instructions: JSON.parse(recipe?.instructions!),
        });
    } catch (err) {
        console.error("Error: failed to fetch recipe", err)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const rateRecipe = async (req: AuthRequest, res: Response) => {

    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "id is missing" })
    }

    const { rating } = req.body;
    if (!rating) {
        return res.status(200).json({ message: "rating are missing" })
    }
    try {
        const recipeId = parseInt(id, 10);

        // Check if user already rated this recipe
        const existing = await db
            .select()
            .from(ratings)
            .where(
                and(eq(ratings.userId, req.user!.id), eq(ratings.recipeId, recipeId))
            );

        if (existing.length > 0) {
            // Update existing rating
            await db
                .update(ratings)
                .set({ rating, updatedAt: sql`(strftime('%s','now'))` })
                .where(
                    and(eq(ratings.userId, req.user!.id), eq(ratings.recipeId, recipeId))
                );
        } else {
            // Insert new rating
            await db.insert(ratings).values({
                userId: req.user!.id,
                recipeId,
                rating,
            });
        }

        // Recompute aggregates
        const agg = await db
            .select({
                avg: sql<number>`avg(${ratings.rating})`,
                count: sql<number>`count(*)`,
            })
            .from(ratings)
            .where(eq(ratings.recipeId, recipeId));

        const averageRating = Number(agg[0]?.avg) || 0;
        const totalRatings = Number(agg[0]?.count) || 0;

        // Update recipe with aggregates
        await db
            .update(recipes)
            .set({
                averageRating,
                totalRatings,
                updatedAt: sql`(strftime('%s','now'))`,
            })
            .where(eq(recipes.id, recipeId));

        res.status(200).json({
            message: "Rating updated successfully",
        });
    } catch (err) {
        console.error("Error: failed to update recipes", err)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const saveRecipe = async (req: AuthRequest, res: Response) => {

    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "id is missing" })
    }

    try {
        const recipeId = parseInt(id, 10);

        // Check if recipe is already saved
        const existing = await db
            .select()
            .from(savedRecipes)
            .where(
                and(eq(savedRecipes.userId, req.user!.id), eq(savedRecipes.recipeId, recipeId))
            );

        if (existing.length > 0) {
            // if already saved, then unsave
            await db
                .delete(savedRecipes)
                .where(
                    and(eq(savedRecipes.userId, req.user!.id), eq(savedRecipes.recipeId, recipeId))
                );

            return res.json({ saved: false });
        }

        // Not saved, then save
        await db.insert(savedRecipes).values({
            userId: req.user!.id,
            recipeId,
            createdAt: sql`(strftime('%s','now'))`,
            updatedAt: sql`(strftime('%s','now'))`,
        });

        res.status(200).json({ message: "recipe saved successfully" });
    } catch (err) {
        console.error("Error: failed to update recipes", err)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getSavedRecipes = async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unautiorized" })
    }
    try {
        const results = await db
            .select({
                id: recipes.id,
                title: recipes.title,
                description: recipes.description,
                averageRating: recipes.averageRating,
            })
            .from(recipes)
            .innerJoin(savedRecipes, eq(savedRecipes.recipeId, recipes.id))
            .where(eq(savedRecipes.userId, req.user!.id));

        res.json({ data: results });
    } catch (err) {
        console.error("Error: failed to fetch saved recipes", err)
        return res.status(500).json({ message: "Internal server error" })
    }
}
