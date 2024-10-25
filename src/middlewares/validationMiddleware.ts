import { z, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
// Zod schemas for validation
export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const dogSchema = z.object({
  name: z.string(),
  breed: z.string(),
  ownerId: z.number(),
});

const jwtInfoSchema = z.object({
  email: z.string().email(),
  iat: z.number(),
});

// Middleware to check if the user is authenticated
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers["authorization"];

  if (!token) {
    res.status(401).json({ message: "No token provided. Unauthorized." });
    return;
  }

  try {
    const jwtToken = token.split(" ")[1];
    const decoded = jwt.verify(
      jwtToken,
      process.env.JWT_SECRET || "your_secret_key"
    );
    const user = userSchema.parse(decoded) as {
      password: string;
      email: string;
      id: number;
    };
    const userFromJwt = await prisma.user.findFirst({
      where: {
        email: user.email,
      },
    });
    if (!userFromJwt) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    req.user = userFromJwt;
    next();
    return;
  } catch (error) {
    res.status(401).json({ message: "Invalid token. Unauthorized." });
    return;
  }
};

export const validate =
  (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers["authorization"];

    try {
      // Parse the incoming request body with the provided Zod schema
      schema.parse(req.body);

      // If validation succeeds, proceed to the next middleware or route
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        // If ZodError occurs, respond with status 400 and the validation errors
        res.status(400).json({ errors: err.errors });
      } else {
        next(err);
      }
    }
  };
