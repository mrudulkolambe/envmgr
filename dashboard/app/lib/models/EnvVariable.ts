import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IEnvVariable extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  environmentId: mongoose.Types.ObjectId;
  key: string;
  value: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EnvVariableSchema = new Schema<IEnvVariable>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true,
    },
    environmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Environment',
      required: [true, 'Environment ID is required'],
      index: true,
    },
    key: {
      type: String,
      required: [true, 'Variable key is required'],
      trim: true,
      uppercase: true,
      match: [
        /^[A-Z0-9_]+$/,
        'Key can only contain uppercase letters, numbers, and underscores',
      ],
    },
    value: {
      type: String,
      required: [true, 'Variable value is required'],
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
    collection: 'env_variables',
  }
);

EnvVariableSchema.index({ environmentId: 1, key: 1 }, { unique: true });
EnvVariableSchema.index({ projectId: 1 });

EnvVariableSchema.statics = {
  findByEnvironment: async function (environmentId: string) {
    return this.find({ environmentId }).sort({ key: 1 });
  },
  
  findByProject: async function (projectId: string) {
    return this.find({ projectId }).sort({ key: 1 });
  },
  
  findByKey: async function (environmentId: string, key: string) {
    return this.findOne({ environmentId, key: key.toUpperCase() });
  },
};

const EnvVariable: Model<IEnvVariable> =
  mongoose.models.EnvVariable || mongoose.model<IEnvVariable>('EnvVariable', EnvVariableSchema);

export default EnvVariable;
