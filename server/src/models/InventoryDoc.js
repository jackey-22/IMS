import mongoose from "mongoose";

const lineSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    uom: {
      type: String,
      required: true,
      trim: true
    },
    qty: {
      type: Number,
      required: true
    },
    sourceLocationId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    destinationLocationId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    }
  },
  {
    _id: true,
    timestamps: true
  }
);

const inventoryDocSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["receipt", "delivery", "transfer", "adjustment"],
      required: true
    },
    status: {
      type: String,
      enum: ["draft", "waiting", "ready", "done", "canceled"],
      default: "draft"
    },
    documentNo: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    partnerName: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      default: null
    },
    sourceWarehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      default: null
    },
    sourceLocationId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    destinationWarehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      default: null
    },
    destinationLocationId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    validatedAt: {
      type: Date,
      default: null
    },
    scheduledDate: {
      type: Date,
      default: null
    },
    lines: {
      type: [lineSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("InventoryDoc", inventoryDocSchema);
