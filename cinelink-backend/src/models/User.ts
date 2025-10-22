import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    email: string;
    password: string;
    name?: string;
    createdAt: Date;
}

const UserSchema: Schema = new Schema<IUser>({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>("User", UserSchema);
