import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IProjectMember extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: 'maintainer' | 'viewer';
  createdAt: Date;
}

const ProjectMemberSchema = new Schema<IProjectMember>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
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
        values: ['maintainer', 'viewer'],
        message: '{VALUE} is not a valid role',
      },
      required: [true, 'Role is required'],
      default: 'viewer',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'project_members',
  }
);

ProjectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });
ProjectMemberSchema.index({ userId: 1 });

ProjectMemberSchema.statics = {
  findByProject: async function (projectId: string) {
    return this.find({ projectId }).populate('userId', 'name email');
  },
  
  findByUser: async function (userId: string) {
    return this.find({ userId }).populate('projectId', 'name slug');
  },
  
  findMember: async function (projectId: string, userId: string) {
    return this.findOne({ projectId, userId });
  },
};

const ProjectMember: Model<IProjectMember> =
  mongoose.models.ProjectMember || mongoose.model<IProjectMember>('ProjectMember', ProjectMemberSchema);

export default ProjectMember;
