import { connection } from "../config/database.js";
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    address: {
        type: String,
    },
    network: {
        type: String,
    },
    date: {
        type: Date,
        expires: 60 * 60 * 24,
        default: Date.now,
    },
});

const Report = connection.model("Report", reportSchema);

export default Report;
