import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDb } from "./config/db.js";
import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";
import productsRouter from "./routes/products.js";
import warehousesRouter from "./routes/warehouses.js";
import categoriesRouter from "./routes/categories.js";
import usersRouter from "./routes/users.js";
import profileRouter from "./routes/profile.js";
import operationsRouter from "./routes/operations.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/warehouses", warehousesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/users", usersRouter);
app.use("/api/profile", profileRouter);
app.use("/api/operations", operationsRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`IMS API running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed", error);
    process.exit(1);
  });
