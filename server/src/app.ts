import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { protect } from "./middleware/auth.middleware.js";
import { adminOnly } from "./middleware/admin.middleware.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import adminProductRoutes from "./routes/admin/admin.product.routes.js";
import adminCategoryRoutes from "./routes/admin/admin.category.routes.js";
import adminOrderRoutes from "./routes/admin/admin.order.routes.js";
import adminUserRoutes from "./routes/admin/admin.user.routes.js";

const app = express();

// Global middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
    credentials: true,
  })
);
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Public routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);

// Protected routes (require auth)
app.use("/api/cart", protect, cartRoutes);
app.use("/api/orders", protect, orderRoutes);

// Admin routes (require auth + admin role)
app.use("/api/upload", protect, adminOnly, uploadRoutes);
app.use("/api/admin/products", protect, adminOnly, adminProductRoutes);
app.use("/api/admin/categories", protect, adminOnly, adminCategoryRoutes);
app.use("/api/admin/orders", protect, adminOnly, adminOrderRoutes);
app.use("/api/admin/users", protect, adminOnly, adminUserRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
