import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      default: "location",
      trim: true
    },
    parentCode: {
      type: String,
      trim: true,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    _id: true,
    timestamps: true
  }
);

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    locations: {
      type: [locationSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Warehouse", warehouseSchema);
