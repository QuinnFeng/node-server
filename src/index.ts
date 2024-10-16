import express from "express";
import userRoutes from "./routes/userRoutes";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Use the userRoutes
app.use(userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
