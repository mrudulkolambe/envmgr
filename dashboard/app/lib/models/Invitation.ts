import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IInvitation extends Document {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  email: string;
  role: 'admin' | 'member';
  invitedBy: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'revoked';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },

    role: {
      type: String,
      enum: {
        values: ['admin', 'member'],
        message: '{VALUE} is not a valid role',
      },
      required: [true, 'Role is required'],
      default: 'member',
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Inviter ID is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'revoked'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
    },

    expiresAt: {
      type: Date,
      required: true,
    },

  },
  {
    timestamps: true,
    collection: 'invitations',
  }
);

InvitationSchema.index({ organizationId: 1, email: 1, status: 1 });
InvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Invitation: Model<IInvitation> =
  mongoose.models.Invitation || mongoose.model<IInvitation>('Invitation', InvitationSchema);

export default Invitation;
