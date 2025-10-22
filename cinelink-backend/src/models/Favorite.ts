import mongoose, { Document, Schema } from "mongoose";

export interface IFavorite extends Document {
    user: mongoose.Types.ObjectId;
    tmdbId: number; // id du film TMDB
    title?: string;
    createdAt: Date;
}

const FavoriteSchema: Schema = new Schema<IFavorite>({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tmdbId: { type: Number, required: true },
    title: { type: String },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IFavorite>("Favorite", FavoriteSchema);
