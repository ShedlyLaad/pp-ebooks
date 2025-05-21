import express from "express";
import {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    deleteOrder,
    getOrderById
} from "../controllers/orderController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/adminMiddleware.js";

const router = express.Router();

// User routes
router.post("/", isAuthenticated, createOrder);
router.get("/my-orders", isAuthenticated, getMyOrders);
router.get("/:id", isAuthenticated, getOrderById);  // Add this new route

// Admin routes
router.get("/", isAuthenticated, isAdmin, getAllOrders);
router.put("/:id", isAuthenticated, isAdmin, updateOrderStatus);
router.delete("/:id", isAuthenticated, isAdmin, deleteOrder);

export default router;
