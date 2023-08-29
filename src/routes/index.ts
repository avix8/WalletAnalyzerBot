import { Telegraf } from "telegraf";
import { reportRateLimiter } from "../middlewares/rateLimiters.js";
import { role } from "../middlewares/role.js";
import { sendReport } from "../controllers/analyze.js";
import { start } from "../controllers/start.js";

export const routes = (bot: Telegraf) => {
    start(bot);
    bot.command("analyze", role, reportRateLimiter, sendReport);
    bot.help((ctx) =>
        ctx.reply(
            "Справка:\n" +
                "/start - Начать взаимодействие с ботом и выбрать роль.\n" +
                "/help - Получить справочную информацию о доступных командах.\n" +
                "/analyze <адрес> eth - Сформировать отчёт по кошельку."
        )
    );
};
