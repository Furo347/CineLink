import mongoose, { Document, Schema } from "mongoose";

export type AvatarKey = "avatar1" | "avatar2" | "avatar3" | "avatar4" | "avatar5";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar: AvatarKey;
    createdAt: Date;
}

const UserSchema: Schema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        enum: ["avatar1", "avatar2", "avatar3", "avatar4", "avatar5"],
        default: "avatar1",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model<IUser>("User", UserSchema);
