import mongoose from "mongoose";

const stockBalanceSchema = new mongoose.Schema(
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
      required: true
    },
    qtyOnHand: {
      type: Number,
      default: 0
    },
    qtyReserved: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

stockBalanceSchema.index({ productId: 1, warehouseId: 1, locationId: 1 }, { unique: true });

export default mongoose.model("StockBalance", stockBalanceSchema);
