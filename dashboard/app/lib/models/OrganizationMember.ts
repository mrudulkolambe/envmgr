import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IOrganizationMember extends Document {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: 'owner' | 'admin' | 'member';
  createdAt: Date;
}

const OrganizationMemberSchema = new Schema<IOrganizationMember>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    role: {
      type: String,
      enum: {
        values: ['owner', 'admin', 'member'],
        message: '{VALUE} is not a valid role',
      },
      required: [true, 'Role is required'],
      default: 'member',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'organization_members',
  }
);

OrganizationMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });
OrganizationMemberSchema.index({ userId: 1 });

OrganizationMemberSchema.statics = {
  findByOrganization: async function (organizationId: string) {
    return this.find({ organizationId }).populate('userId', 'name email');
  },
  
  findByUser: async function (userId: string) {
    return this.find({ userId }).populate('organizationId', 'name slug');
  },
  
  findMember: async function (organizationId: string, userId: string) {
    return this.findOne({ organizationId, userId });
  },
};

const OrganizationMember: Model<IOrganizationMember> =
  mongoose.models.OrganizationMember || mongoose.model<IOrganizationMember>('OrganizationMember', OrganizationMemberSchema);

export default OrganizationMember;
