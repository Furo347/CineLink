import mongoose, { Schema, Document } from "mongoose";

export interface IFollow extends Document {
    follower: mongoose.Types.ObjectId;
    following: mongoose.Types.ObjectId;
    createdAt: Date;
}

const FollowSchema = new Schema<IFollow>({
    follower: { type: Schema.Types.ObjectId, ref: "User", required: true },
    following: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IFollow>("Follow", FollowSchema);
