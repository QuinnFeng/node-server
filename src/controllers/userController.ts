import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Register user
export const registerUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: "Email already exists" });
  }
};

// Login user
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const validPassword = await bcrypt.compare(password, user!.password);

    if (!validPassword) {
      res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { email: user.email, password:user.password }, // Payload
      process.env.JWT_SECRET || "your_secret_key", // Secret key
      { expiresIn: "1h" } // Optional: token expiration time
    );

    // Send response with token
    res.status(200).json({ message: "Logged in successfully", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a dog
export const createDog = async (req: Request, res: Response) => {
  const { name, breed, ownerId } = req.body;
  const userId = req.user?.id;
  try {
    if (userId != ownerId) {
      res.status(401).json({ message: "unauthorized access" });
      return;
    }
    const dog = await prisma.dog.create({
      data: {
        name,
        breed,
        ownerId,
      },
    });
    res.status(201).json(dog);
  } catch (error) {
    res.status(400).json({ error: "Error creating dog" });
  }
};
