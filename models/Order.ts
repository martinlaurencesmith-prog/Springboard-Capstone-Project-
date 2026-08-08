//models/Order.ts

import mongoose, { Model, Schema, Types } from "mongoose";

// Delivery Sub-Schema (embedded)
const deliverySchema = new Schema(
  {
    deliveryDate: { type: Date, required: true },
    quantityDelivered: { type: Number, required: true },
    signedBy: { type: String, required: true },
    signatureImage: { type: String },
    notes: { type: String },
  },
  { _id: false },
);

// Payment Sub-Schema (embedded)
const paymentEntrySchema = new Schema(
  {
    amount: { type: Number, required: true },
    method: { type: String },
    notes: { type: String },
    receivedDate: { type: Date, default: Date.now },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false },
);

// Main Order Schema
export interface IOrder {
  client?: Types.ObjectId;
  businessNIT: string;
  businessName?: string;
  book: {
    identification: string;
    coverImage?: string;
  };
  specifications: {
    quantity: number;
    spiralLength: number;
    sheetsPerBook?: number;
    bindingType:
      | "metallic"
      | "plastic"
      | "metallic-hook"
      | "hardbound"
      | "softbound"
      | "other";
    spiralColor?:
      | "black"
      | "white"
      | "silver"
      | "clear"
      | "gold"
      | "rose-gold"
      | "red"
      | "green"
      | "blue"
      | "custom";
    additionalNotes?: string;
  };
  status:
    | "pending"
    | "in-progress"
    | "completed"
    | "cancelled"
    | "partially-delivered"
    | "delivered";
  quote?: {
    totalPrice?: number;
    calculatedAt?: Date;
    breakdown?: any;
  };
  payments?: Array<{
    amount: number;
    method?: string;
    notes?: string;
    receivedDate?: Date;
    recordedBy?: Types.ObjectId;
  }>;
  paymentStatus?: "pending" | "partially-received" | "received" | "verified";
  totalPaid?: number;
  productionNotes?: string;
  supervisor?: Types.ObjectId;
  deliveries: any[];
  createdAt?: Date;
  updatedAt?: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    client: { type: Schema.Types.ObjectId, ref: "User" },
    businessNIT: { type: String, required: true },
    businessName: { type: String },
    book: {
      identification: { type: String, required: true },
      coverImage: { type: String },
    },
    specifications: {
      quantity: { type: Number, required: true },
      spiralLength: { type: Number, required: true },
      sheetsPerBook: { type: Number },
      bindingType: {
        type: String,
        enum: [
          "metallic",
          "plastic",
          "metallic-hook",
          "hardbound",
          "softbound",
          "other",
        ],
        required: true,
      },
      spiralColor: {
        type: String,
        enum: [
          "black",
          "white",
          "silver",
          "clear",
          "gold",
          "rose-gold",
          "red",
          "green",
          "blue",
          "custom",
        ],
      },
      additionalNotes: { type: String },
    },
    status: {
      type: String,
      enum: [
        "pending",
        "in-progress",
        "completed",
        "cancelled",
        "partially-delivered",
        "delivered",
      ],
      default: "pending",
    },
    quote: {
      totalPrice: { type: Number },
      calculatedAt: { type: Date },
      breakdown: { type: Schema.Types.Mixed, default: {} },
    },

    // Multiple payments
    payments: [paymentEntrySchema],
    paymentStatus: {
      type: String,
      enum: ["pending", "partially-received", "received", "verified"],
      default: "pending",
    },
    totalPaid: {
      type: Number,
      default: 0,
    },

    productionNotes: { type: String },
    supervisor: { type: Schema.Types.ObjectId, ref: "User" },
    deliveries: [deliverySchema],
  },
  { timestamps: true },
);

// Indexes
orderSchema.index({ client: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ businessNIT: 1 });

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);

export default Order;
