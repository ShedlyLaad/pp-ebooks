import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Category name is required'],
        trim: true,
        minlength: [2, 'Category name must be at least 2 characters'],
        validate: {
            validator: function(v) {
                return v && v.length >= 2;
            },
            message: props => `${props.value} is not a valid category name! Must be at least 2 characters.`
        }
    }
}, { 
    timestamps: true 
});

// Single index definition with collation
categorySchema.index({ name: 1 }, { 
    unique: true, 
    collation: { locale: 'en', strength: 2 }
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
