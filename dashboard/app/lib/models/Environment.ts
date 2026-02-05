import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IEnvironment extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnvironmentSchema = new Schema<IEnvironment>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Environment name is required'],
      trim: true,
      maxlength: [100, 'Environment name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9-]+$/,
        'Slug can only contain lowercase letters, numbers, and hyphens',
      ],
    },
  },
  {
    timestamps: true,
    collection: 'environments',
  }
);

EnvironmentSchema.index({ projectId: 1, slug: 1 }, { unique: true });
EnvironmentSchema.index({ projectId: 1 });

EnvironmentSchema.statics = {
  findByProject: async function (projectId: string) {
    return this.find({ projectId }).sort({ createdAt: 1 });
  },
  
  findBySlug: async function (projectId: string, slug: string) {
    return this.findOne({ projectId, slug: slug.toLowerCase() });
  },
};

const Environment: Model<IEnvironment> =
  mongoose.models.Environment || mongoose.model<IEnvironment>('Environment', EnvironmentSchema);

export default Environment;
