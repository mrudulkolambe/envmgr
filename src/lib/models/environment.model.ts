import mongoose, { Schema, Document } from 'mongoose';

export interface IEnvironment extends Document {
  _id: string;
  name: string;
  type: 'prod' | 'stage' | 'dev' | 'test';
  status: 'active' | 'inactive' | 'maintenance';
  projectId: string;
  variables: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const EnvironmentSchema = new Schema<IEnvironment>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['prod', 'stage', 'dev', 'test'],
    default: 'dev',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active',
  },
  projectId: {
    type: String,
    required: true,
    index: true,
  },
  variables: {
    type: Map,
    of: String,
    default: {},
  },
}, {
  timestamps: true,
});

export default mongoose.models.Environment || mongoose.model<IEnvironment>('Environment', EnvironmentSchema);
