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

// Pre-save middleware to set status based on due date and returned status
rentalSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.isModified('returned') && this.returned) {
    this.status = 'returned';
    this.returnedAt = now;
  } else if (!this.returned) {
    if (this.dueDate < now) {
      this.status = 'overdue';
    } else {
      // Only update to active if it's not already overdue
      if (this.status !== 'overdue') {
        this.status = 'active';
      }
    }
  }
  next();
});

export default mongoose.model("Rental", rentalSchema);
