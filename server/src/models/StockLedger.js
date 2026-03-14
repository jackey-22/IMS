import mongoose from "mongoose";

const stockLedgerSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryDoc",
      required: true
    },
    type: {
      type: String,
      enum: ["receipt", "delivery", "transfer", "adjustment"],
      required: true
    },
    qtyIn: {
      type: Number,
      default: 0
    },
    qtyOut: {
      type: Number,
      default: 0
    },
    balanceAfter: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

stockLedgerSchema.index({ productId: 1, createdAt: 1 });

export default mongoose.model("StockLedger", stockLedgerSchema);
