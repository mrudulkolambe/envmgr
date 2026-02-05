import mongoose, { Schema, Model, Document } from 'mongoose';

export interface ISession extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  token: string;
  type: 'session' | 'cli';
  name?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  lastUsedAt?: Date | null;
  expiresAt?: Date | null;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    token: {
      type: String,
      required: [true, 'Token is required'],
      unique: true,
    },
    type: {
      type: String,
      enum: {
        values: ['session', 'cli'],
        message: '{VALUE} is not a valid session type',
      },
      required: [true, 'Session type is required'],
    },
    name: {
      type: String,
      required: false,
      default: null,
    },
    ipAddress: {
      type: String,
      required: false,
      default: null,
    },
    userAgent: {
      type: String,
      required: false,
      default: null,
    },
    lastUsedAt: {
      type: Date,
      required: false,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: false,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'sessions',
  }
);

SessionSchema.index({ token: 1 }, { unique: true });
SessionSchema.index({ userId: 1, type: 1 });
SessionSchema.index({ expiresAt: 1 });

SessionSchema.statics = {
  findByToken: async function (token: string) {
    return this.findOne({ token });
  },
  
  findActiveByUserId: async function (userId: string) {
    return this.find({
      userId,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    });
  },
  
  deleteExpired: async function () {
    return this.deleteMany({
      expiresAt: { $lte: new Date() }
    });
  },
};

const Session: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);

export default Session;
