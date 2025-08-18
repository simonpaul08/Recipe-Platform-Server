import Express from "express";
import { env } from "./config.js";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.route.js";
import recipeRoutes from "./routes/recipe.route.js";
import { authMiddleware } from "./middleware/auth.js";

const PORT = env.PORT || 4000
const app = Express();


app.use(helmet());
app.use(cors());
app.use(Express.json());
app.use(morgan("dev"));

app.get("/", (rea, res) => {
    res.status(200).json({ message: "server is up and running" })
})

// routes
app.use("/api/auth", authRoutes)
app.use("/api/recipe", recipeRoutes)


app.listen(PORT, () => {
    console.log("server is up and running")
})