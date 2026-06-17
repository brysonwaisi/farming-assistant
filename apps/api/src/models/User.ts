import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  image: string;
  isAdmin: boolean;
  lastLogin: Date;
  isVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpiresAt?: Date;
  verificationToken?: string;
  verificationTokenExpiresAt?: Date;
  refreshTokenHash?: string;
  refreshTokenExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, default: '' },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    refreshTokenHash: { type: String, select: false },
    refreshTokenExpiresAt: { type: Date, select: false },
  },
  { timestamps: true },
);

export default model<IUser>('User', UserSchema);
