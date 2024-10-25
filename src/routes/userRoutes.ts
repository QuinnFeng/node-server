import { Router } from "express";
import {
  validate,
  userSchema,
  dogSchema,
  authenticateUser,
} from "../middlewares/validationMiddleware";
import {
  registerUser,
  loginUser,
  createDog,
} from "../controllers/userController";

const router = Router();

// Register route with validation middleware
router.post("/register", validate(userSchema), registerUser);

// Login route with validation middleware
router.post("/login", validate(userSchema), loginUser);

// Dog creation route with validation middleware
router.post("/dogs", authenticateUser,validate(dogSchema), createDog);

export default router;
