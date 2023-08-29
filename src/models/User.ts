import { connection } from "../config/database.js";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const User = connection.model("User", userSchema);

export default User;
