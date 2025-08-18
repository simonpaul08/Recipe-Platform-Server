import { Router } from "express";
import { createRecipe, getRecipeById, getSavedRecipes, listRecipes, rateRecipe, saveRecipe } from "../controller/recipe.controller.js";
import { authMiddleware } from "../middleware/auth.js";


const router = Router();

router.use(authMiddleware)

router.route("/")
    .get(listRecipes)
    .post(createRecipe)

router.route("/:id")
    .get(getRecipeById)

router.route("/:id/rate")
    .patch(rateRecipe)

router.route("/:id/save")
    .post(saveRecipe)

router.route("/me/saved")
    .get(getSavedRecipes)



export default router;
