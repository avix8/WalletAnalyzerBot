import { Telegraf } from "telegraf";
import { config } from "dotenv-defaults";
import { connect } from "./config/database.js";
import { routes } from "./routes/index.js";

config();

const bot = new Telegraf(process.env.BOT_TOKEN);

routes(bot);

await Promise.all([connect(), bot.telegram.getMe()]);
console.log(`🤖 WAB successfully started: https://t.me/WalletAnalyzerBot`);
bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
