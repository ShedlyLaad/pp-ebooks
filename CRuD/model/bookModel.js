import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    price: { type: Number, required: true },
    desc: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dateRealisation: { type: Date },
    stock: { type: Number, required: true, default: 0, min: 0 },
    poster: { type: String } // Champ pour l'URL de l'image
}, { timestamps: true });

export default mongoose.model("Book", bookSchema);
