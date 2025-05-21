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
    getAuthorStats
} from "../controllers/bookController.js";
import { isAdmin } from "../middlewares/adminMiddleware.js";
import { isAuthor } from "../middlewares/authorMiddleware.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/search", searchBooks);
router.get("/categories", getCategories);

// Protected routes
router.get("/my-books", isAuthenticated, isAuthor, getMyBooks);
router.get("/author/stats", isAuthenticated, isAuthor, getAuthorStats);
import { handleBookUpload } from "../middlewares/bookUploadMiddleware.js";

router.post("/", isAuthenticated, isAuthor, handleBookUpload, createBook);
router.put("/:id", isAuthenticated, isAuthor, handleBookUpload, updateBook);

// Admin only routes
router.get("/", isAuthenticated, isAdmin, getAllBooks);
router.get("/:id", isAuthenticated, isAdmin, getBookById);
router.delete("/:id", isAuthenticated, isAdmin, deleteBook);

export default router;
