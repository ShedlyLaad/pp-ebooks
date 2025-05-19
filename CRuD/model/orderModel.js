import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  quantity: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderItems: [orderItemSchema],
  status: { type: String, enum: ["pending", "confirmed", "shipped", "delivered"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Order", orderSchema);
