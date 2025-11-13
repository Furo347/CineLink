import mongoose, { Document, Schema } from "mongoose";

export interface IFavorite extends Document {
    user: mongoose.Types.ObjectId;
    tmdbId: number;
    title?: string;
    rating?: number;
    createdAt: Date;
}

const FavoriteSchema: Schema = new Schema<IFavorite>({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tmdbId: { type: Number, required: true },
    title: { type: String },
    rating: { type: Number, min: 0, max: 10 },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IFavorite>("Favorite", FavoriteSchema);
