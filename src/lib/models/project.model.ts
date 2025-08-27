import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  _id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
