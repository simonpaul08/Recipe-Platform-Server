import type { Request, Response } from "express";
import { db, users } from "../db/db.js";
import { eq } from "drizzle-orm";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { signJwt } from "../utils/jwt.js";


export const register = async (req: Request, res: Response) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "all fields are required" })
    }

    try {
        // Check if user exists
        const existing = await db.select().from(users).where(eq(users.email, email));
        if (existing.length > 0) return res.status(400).json({ error: "Email already in use" });

        // Hash password
        const passwordHash = await hashPassword(password);

        // Insert user
        const result = await db.insert(users).values({ name, email, passwordHash })
        if (!result) {
            return res.status(500).json({ message: "failed to create the user" })
        }

        return res.status(201).json({ message: "user registered successfully" });
    } catch (error) {
        console.error("Error: failed to create user ", error)
        return res.status(500).json({ message: "Internal server error" })
    }


}

export const login = async (req: Request, res: Response) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "all fields are required" })
    }

    try {
        // Check if user exists
        const found = await db.select().from(users).where(eq(users.email, email));
        if (found.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = found[0];
        if(!user) {
            return res.status(404).json({ message: "user does not exists" })
        }

        // Check password
        const match = await comparePassword(password, user.passwordHash);
        if (!match) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = signJwt({ userId: user.id });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error("Error: failed to login user ", error)
        return res.status(500).json({ message: "Internal server error" })
    }


}