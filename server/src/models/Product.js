import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null
    },
    uom: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    barcode: {
      type: String,
      trim: true
    },
    reorderPoint: {
      type: Number,
      default: 0
    },
    reorderQty: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Product", productSchema);
