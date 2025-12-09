import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
    user: mongoose.Types.ObjectId;
    movieId: number;
    content: string;
    createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        movieId: {
            type: Number,
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        }
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IComment>("Comment", CommentSchema);
