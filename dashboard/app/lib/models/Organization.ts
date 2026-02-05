import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IOrganization extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      maxlength: [100, 'Organization name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9-]+$/,
        'Slug can only contain lowercase letters, numbers, and hyphens',
      ],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'organizations',
  }
);

OrganizationSchema.index({ slug: 1 }, { unique: true });
OrganizationSchema.index({ createdBy: 1 });

OrganizationSchema.statics = {
  findBySlug: async function (slug: string) {
    return this.findOne({ slug });
  },
  
  findByCreator: async function (createdBy: string) {
    return this.find({ createdBy }).sort({ createdAt: -1 });
  },
};

const Organization: Model<IOrganization> =
  mongoose.models.Organization || mongoose.model<IOrganization>('Organization', OrganizationSchema);

export default Organization;
