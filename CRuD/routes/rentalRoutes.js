import express from "express";
import {
    rentBook,
    getMyRentals,
    getAllRentals,
    returnBook,
    deleteRental
} from "../controllers/rentalController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/adminMiddleware.js";

const router = express.Router();

// Wrap route handlers in try-catch blocks to properly handle async errors
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// User routes
router.post("/", isAuthenticated, asyncHandler(rentBook));
router.get("/my-rentals", isAuthenticated, asyncHandler(getMyRentals));
router.put("/return/:rentalId", isAuthenticated, asyncHandler(returnBook));

// Admin routes
router.get("/", isAuthenticated, isAdmin, asyncHandler(getAllRentals));
router.delete("/:id", isAuthenticated, isAdmin, asyncHandler(deleteRental));

export default router;
