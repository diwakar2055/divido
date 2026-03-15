import mongoose, { Document, Schema } from 'mongoose';

interface IInvitation extends Document {
  email: string;
  groupId: mongoose.Types.ObjectId;
  token: string;
  createdBy: mongoose.Types.ObjectId;
  expiresAt: Date;
  accepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const invitationSchema = new Schema<IInvitation>(
  {
    email: { type: String, required: true, lowercase: true },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    token: { type: String, required: true, unique: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
    accepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index to cleanup expired invitations
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Invitation = mongoose.model<IInvitation>('Invitation', invitationSchema);
