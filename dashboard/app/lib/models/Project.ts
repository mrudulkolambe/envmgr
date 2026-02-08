import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  repo?: {
    provider?: 'github' | 'gitlab' | 'bitbucket';
    url?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
    },

    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
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
    description: {
      type: String,
      required: false,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    repo: {
      provider: {
        type: String,
        enum: {
          values: ['github', 'gitlab', 'bitbucket'],
          message: '{VALUE} is not a valid repository provider',
        },
        required: false,
      },
      url: {
        type: String,
        required: false,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
    collection: 'projects',
  }
);

ProjectSchema.index({ organizationId: 1, slug: 1 }, { unique: true });
ProjectSchema.index({ organizationId: 1 });

ProjectSchema.statics = {
  findByOrganization: async function (organizationId: string) {
    return this.find({ organizationId }).sort({ createdAt: -1 });
  },
  
  findBySlug: async function (organizationId: string, slug: string) {
    return this.findOne({ organizationId, slug });
  },
};

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
