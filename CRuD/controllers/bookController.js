import Book from "../model/bookModel.js";
import Category from "../model/categoryModel.js";
import Order from "../model/orderModel.js";
import multer from "multer";
import path from "path";

// Configuration de multer pour le stockage des images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/books/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // limite de 5MB
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Seules les images sont autorisées"));
  }
}).single('poster');

export const createBook = async (req, res) => {
  try {
    upload(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: "Erreur lors de l'upload: " + err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }

      const { title, price, desc, category, dateRealisation, stock } = req.body;

      // Validation des champs requis
      if (!title || !price || !desc || !category) {
        return res.status(400).json({ 
          message: "Tous les champs sont obligatoires (titre, prix, description et catégorie)" 
        });
      }

      try {
        let categoryDoc;
        
        if (category) {
          categoryDoc = await Category.findOne({ 
            name: { $regex: new RegExp(`^${category.trim()}$`, 'i') }
          });

          if (!categoryDoc) {
            categoryDoc = new Category({ name: category.trim() });
            await categoryDoc.save();
          }
        }

        const newBook = new Book({
          title: title.trim(),
          author: req.user.name,
          price: Number(price),
          desc: desc.trim(),
          category: categoryDoc._id,
          dateRealisation: dateRealisation || new Date(),
          authorId: req.user.id,
          stock: Number(stock) || 0,
          poster: req.file ? `/uploads/books/${req.file.filename}` : undefined
        });

        await newBook.save();
        const populatedBook = await Book.findById(newBook._id).populate('category');

        res.status(201).json({
          success: true,
          message: "Livre créé avec succès",
          book: populatedBook
        });

      } catch (error) {
        console.error("Erreur lors de la création:", error);
        
        if (error.name === 'ValidationError') {
          return res.status(400).json({
            message: "Erreur de validation",
            details: Object.values(error.errors).map(err => err.message)
          });
        }
        throw error;
      }
    });
  } catch (error) {
    console.error("Erreur serveur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du livre",
      error: error.message
    });
  }
};

// Admin ou Author (update)
export const updateBook = async (req, res) => {
  try {
    upload(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: "Erreur lors de l'upload: " + err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }

      const { title, author, price, desc, category, dateRealisation, stock } = req.body;
      
      // Vérifier si le livre existe
      const book = await Book.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }

      // Vérifier les permissions
      if (req.user.role === "author" && book.authorId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Accès refusé: Vous pouvez uniquement modifier vos propres livres" });
      }

      // Gérer la catégorie
      let categoryDoc;
      if (category) {
        categoryDoc = await Category.findOne({ 
          name: { $regex: new RegExp(`^${category.trim()}$`, 'i') }
        });

        if (!categoryDoc) {
          categoryDoc = new Category({ name: category.trim() });
          await categoryDoc.save();
        }
      }

      // Préparer les données à mettre à jour
      const updateData = {
        title: title?.trim(),
        author: author?.trim(),
        price: price ? Number(price) : undefined,
        desc: desc?.trim(),
        category: categoryDoc ? categoryDoc._id : undefined,
        dateRealisation: dateRealisation || undefined,
        stock: stock ? Number(stock) : undefined
      };

      // Ajouter l'image si elle est fournie
      if (req.file) {
        updateData.poster = `/uploads/books/${req.file.filename}`;
      }

      // Supprimer les champs undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      // Mettre à jour le livre
      const updatedBook = await Book.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).populate("category");

      res.status(200).json({
        success: true,
        message: "Livre mis à jour avec succès",
        book: updatedBook
      });
    });
  } catch (error) {
    console.error("Erreur de mise à jour:", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la mise à jour du livre",
      error: error.message
    });
  }
};

// Admin uniquement
export const deleteBook = async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) return res.status(404).json({ message: "Book Not Found" });
    res.status(200).json({ message: "Book deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server ERROR!" });
  }
};

// Admin uniquement
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("category");
    if (!book) return res.status(404).json({ message: "Book Not Found" });
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: "Internal Server ERROR!" });
  }
};

// Admin uniquement
export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().populate("category");
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: "Internal Server ERROR!" });
  }
};

// Auteur uniquement
export const getMyBooks = async (req, res) => {
  try {
    const books = await Book.find({ authorId: req.user.id }).populate("category");
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: "Internal Server ERROR!" });
  }
};

export const searchBooks = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, inStock, sortBy = 'newest' } = req.query;

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      const categoryDoc = await Category.findOne({ name: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Sorting
    let sort = {};
    switch (sortBy) {
      case 'oldest':
        sort = { dateRealisation: 1 };
        break;
      case 'priceLow':
        sort = { price: 1 };
        break;
      case 'priceHigh':
        sort = { price: -1 };
        break;
      default: // newest
        sort = { dateRealisation: -1 };
    }

    const books = await Book.find(query)
      .populate('category')
      .sort(sort)
      .lean();

    res.status(200).json({
      success: true,
      data: books
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching books",
      error: error.message
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch categories",
      error: error.message
    });
  }
};

export const getAuthorStats = async (req, res) => {
    try {
        // Get user ID from auth middleware
        const authorId = req.user.id;

        // Get total books
        const totalBooks = await Book.countDocuments({ authorId });

        // Get average rating
        const books = await Book.find({ authorId });
        let totalRating = 0;
        let ratedBooks = 0;
        books.forEach(book => {
            if (book.rating && book.rating > 0) {
                totalRating += book.rating;
                ratedBooks++;
            }
        });
        const avgRating = ratedBooks > 0 ? totalRating / ratedBooks : 0;

        // Get total sales (from orders)
        const orders = await Order.find({ 'items.book': { $in: books.map(b => b._id) } });
        let totalSales = 0;
        orders.forEach(order => {
            order.items.forEach(item => {
                if (books.some(b => b._id.equals(item.book))) {
                    totalSales += item.quantity;
                }
            });
        });

        res.status(200).json({
            success: true,
            data: {
                totalBooks,
                avgRating,
                totalSales
            }
        });
    } catch (error) {
        console.error('Error getting author stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving author statistics',
            error: error.message
        });
    }
};