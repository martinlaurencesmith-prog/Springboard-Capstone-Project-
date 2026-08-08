// models/User.ts

import mongoose, { Document, Schema, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "client" | "staff" | "admin";
  phone?: string;
  address?: string;
  businessName?: string;
  businessNIT: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["client", "staff", "admin"],
      default: "client",
    },
    phone: { type: String },
    address: { type: String },
    businessName: { type: String },
    businessNIT: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default User;
