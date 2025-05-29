import express from "express";
import {
    createBook,
    deleteBook,
    getAllBooks,
    getBookById,
    updateBook,
    getMyBooks,
    searchBooks,
    getCategories,
    getAuthorStats,
    getBookByIdPublic
} from "../controllers/bookController.js";
import { isAdmin } from "../middlewares/adminMiddleware.js";
import { isAuthor } from "../middlewares/authorMiddleware.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { handleBookUpload } from "../middlewares/bookUploadMiddleware.js";

const router = express.Router();

// Public routes
router.get("/search", searchBooks);
router.get("/categories", getCategories);
router.get("/public/:id", getBookByIdPublic); // Nouvelle route publique

// Protected routes
router.get("/my-books", isAuthenticated, isAuthor, getMyBooks);
router.get("/author/stats", isAuthenticated, isAuthor, getAuthorStats);

// Routes for both Authors and Admins
router.post("/", isAuthenticated, isAdmin, handleBookUpload, createBook);
router.put("/:id", isAuthenticated, isAdmin, handleBookUpload, updateBook);

// Admin only routes
router.get("/", isAuthenticated, isAdmin, getAllBooks);
router.get("/:id", isAuthenticated, isAdmin, getBookById);
router.delete("/:id", isAuthenticated, isAdmin, deleteBook);

export default router;
