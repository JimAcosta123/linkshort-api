import { Schema, model, Document } from 'mongoose';

export interface IClick {
  at: Date;
  referrer?: string;
  userAgent?: string;
}

export interface ILink extends Document {
  shortCode: string;
  originalUrl: string;
  clicks: number;
  lastClicks: IClick[];
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const clickSchema = new Schema<IClick>(
  {
    at: { type: Date, required: true },
    referrer: { type: String },
    userAgent: { type: String },
  },
  { _id: false },
);

const linkSchema = new Schema<ILink>(
  {
    shortCode: { type: String, required: true, unique: true, index: true },
    originalUrl: { type: String, required: true, trim: true },
    clicks: { type: Number, default: 0 },
    // Guardamos solo los ultimos clics para no hacer crecer el documento sin limite
    lastClicks: { type: [clickSchema], default: [] },
    expiresAt: { type: Date },
  },
  { timestamps: true },
);

export const Link = model<ILink>('Link', linkSchema);
