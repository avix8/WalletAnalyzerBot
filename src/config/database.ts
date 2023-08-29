import mongoose from "mongoose";
mongoose.set("strictQuery", false);

export const connection = mongoose.createConnection();

export const connect = () =>
    connection
        .openUri(process.env.MONGO_URI, {})
        .then(() => {
            console.log("👏 Connected to database");
        })
        .catch((err) => {
            console.log("📛 Failed to connect to database");
            console.error(err);
        });
