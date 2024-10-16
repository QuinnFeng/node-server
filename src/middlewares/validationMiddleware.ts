import { z, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

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

export const validate =
  (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
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
