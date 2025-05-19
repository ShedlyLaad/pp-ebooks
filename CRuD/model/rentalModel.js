import mongoose from "mongoose";

const rentalSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  bookId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Book", 
    required: true 
  },
  rentedAt: { 
    type: Date, 
    default: Date.now,
    required: true
  },
  dueDate: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(value) {
        return value > this.rentedAt;
      },
      message: 'Due date must be after rental date'
    }
  },
  returned: { 
    type: Boolean, 
    default: false 
  },
  status: { 
    type: String, 
    enum: ["active", "overdue", "returned"], 
    default: "active" 
  },
  returnedAt: {
    type: Date,
    default: null
  }
});

// Pre-save middleware to set status based on due date
rentalSchema.pre('save', function(next) {
  if (this.isModified('returned') && this.returned) {
    this.status = 'returned';
    this.returnedAt = new Date();
  } else if (!this.returned && this.dueDate < new Date()) {
    this.status = 'overdue';
  }
  next();
});

export default mongoose.model("Rental", rentalSchema);
