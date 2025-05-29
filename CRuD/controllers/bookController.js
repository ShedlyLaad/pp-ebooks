import Book from "../model/bookModel.js";
import Category from "../model/categoryModel.js";
import Order from "../model/orderModel.js";

export const createBook = async (req, res) => {
  try {

    const { title, price, desc, category, dateRealisation, stock, author: submittedAuthor } = req.body;

    if (!title || !price || !desc || !category) {
      return res.status(400).json({ 
        success: false,
        message: "Tous les champs sont obligatoires (titre, prix, description et catégorie)" 
      });
    }

    // Find or create category
    let categoryDoc = await Category.findOne({ 
      name: { $regex: new RegExp(`^${category.trim()}$`, 'i') }
    });

    if (!categoryDoc) {
      categoryDoc = new Category({ name: category.trim() });
      await categoryDoc.save();
    }

    // Si c'est un admin, il peut spécifier l'auteur, sinon on utilise le nom de l'utilisateur
    const bookAuthor = req.user.role === 'admin' ? (submittedAuthor || req.user.name) : req.user.name;

    // Prepare poster URL if file was uploaded
    const posterUrl = req.file 
      ? `${req.protocol}://${req.get('host')}/uploads/books/${req.file.filename}`
      : null;

    const newBook = new Book({
      title: title.trim(),
      author: bookAuthor,
      price: Number(price),
      desc: desc.trim(),
      category: categoryDoc._id,
      dateRealisation: dateRealisation || new Date(),
      authorId: req.user.id,
      stock: Number(stock) || 0,
      poster: posterUrl
    });

    const savedBook = await newBook.save();
    const populatedBook = await Book.findById(savedBook._id).populate('category');

    res.status(201).json({
      success: true,
      message: "Livre créé avec succès",
      book: populatedBook
    });
  } catch (error) {
    console.error("Erreur serveur:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Erreur lors de la création du livre",
      error: error.message
    });
  }
};

export const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('category');
    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: "Livre non trouvé" 
      });
    }

    // Vérifier les permissions : l'auteur ne peut modifier que ses propres livres
    if (req.user.role === "author" && book.authorId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "Accès refusé: Vous pouvez uniquement modifier vos propres livres" 
      });
    }

    const { title, author: submittedAuthor, price, desc, category, dateRealisation, stock } = req.body;

    // Validate required fields
    if (!title || price === undefined || !desc || !category) {
      return res.status(400).json({ 
        success: false,
        message: "Tous les champs sont obligatoires (titre, prix, description et catégorie)" 
      });
    }

    // Validate numeric values
    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Le prix doit être un nombre positif"
      });
    }

    if (isNaN(numericStock) || numericStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Le stock doit être un nombre positif"
      });
    }

    // Find or create category
    let categoryDoc = await Category.findOne({ 
      name: { $regex: new RegExp(`^${category.trim()}$`, 'i') }
    });

    if (!categoryDoc) {
      categoryDoc = new Category({ name: category.trim() });
      await categoryDoc.save();
    }

    // Si c'est un admin, il peut spécifier l'auteur, sinon garder l'auteur actuel
    const bookAuthor = req.user.role === 'admin' ? (submittedAuthor || book.author) : book.author;

    // Prepare poster URL if file was uploaded
    const posterUrl = req.file 
      ? `${req.protocol}://${req.get('host')}/uploads/books/${req.file.filename}`
      : book.poster;

    const updateData = {
      title: title.trim(),
      author: bookAuthor,
      price: numericPrice,
      desc: desc.trim(),
      category: categoryDoc._id,
      stock: numericStock,
      poster: posterUrl
    };

    // N'ajouter dateRealisation que si une valeur valide est fournie
    if (dateRealisation && !isNaN(new Date(dateRealisation))) {
      updateData.dateRealisation = dateRealisation;
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('category');

    res.json({
      success: true,
      message: "Livre mis à jour avec succès",
      book: updatedBook
    });
  } catch (error) {
    console.error("Erreur serveur:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Erreur lors de la mise à jour du livre",
      error: error.message
    });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) return res.status(404).json({ message: "Book Not Found" });
    res.status(200).json({ message: "Book deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server ERROR!" });
  }
};

export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("category");
    if (!book) return res.status(404).json({ message: "Book Not Found" });
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: "Internal Server ERROR!" });
  }
};

export const getBookByIdPublic = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("category")
      .populate("authorId", "name"); // On ne renvoie que le nom de l'auteur pour la version publique

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Livre non trouvé"
      });
    }

    const bookData = {
      ...book.toObject(),
      poster: book.poster ? `${req.protocol}://${req.get('host')}/uploads/books/${book.poster}` : null,
      // On supprime les informations sensibles si nécessaire
      authorName: book.author,
      category: book.category.name
    };

    // Supprime les champs sensibles ou inutiles pour la version publique
    delete bookData.authorId;
    delete bookData.__v;

    res.status(200).json({
      success: true,
      data: bookData
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du livre:", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la récupération du livre",
      error: error.message 
    });
  }
};

export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().populate("category");
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: "Internal Server ERROR!" });
  }
};

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

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }    if (category) {
      // Handle both ID and name for backward compatibility
      let categoryDoc;
      try {
        categoryDoc = await Category.findById(category);
      } catch {
        categoryDoc = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
      }
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
      default: 
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
        const authorId = req.user.id;

        const totalBooks = await Book.countDocuments({ authorId });

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