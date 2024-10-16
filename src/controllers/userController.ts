import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

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
    }

    const validPassword = await bcrypt.compare(password, user!.password);

    if (!validPassword) {
      res.status(401).json({ error: "Invalid credentials" });
    }

    // Optionally, you could add logic for generating a token here (e.g., JWT)

    res.status(200).json({ message: "Logged in successfully" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a dog
export const createDog = async (req: Request, res: Response) => {
  const { name, breed, ownerId } = req.body;

  try {
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
