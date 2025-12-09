import mongoose, { Schema, Document } from "mongoose";

export interface IActivity extends Document {
    actor: mongoose.Types.ObjectId;
    type: string;
    targetMovie?: number;
    targetUser?: mongoose.Types.ObjectId;
    payload?: any;
    createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>({
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    targetMovie: { type: Number },
    targetUser: { type: Schema.Types.ObjectId, ref: "User" },
    payload: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IActivity>("Activity", ActivitySchema);
