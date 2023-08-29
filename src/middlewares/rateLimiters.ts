import { Context, MiddlewareFn } from "telegraf";

import Report from "../models/Report.js";

const getMessage = (ctx: Context) => {
    let message = "Вы достигли лимита запросов в сутки.";
    if (ctx.state.userRole === "user") {
        message += ' Для увеличения количества запросов вы можете перейти на тариф "Аналитик"';
    }
    return message;
};

export const reportRateLimiter: MiddlewareFn<Context> = async (ctx, next) => {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);

    const limit = ctx.state.reportLimit;
    let reportsNumber = await Report.find({
        id: ctx.from.id,
        date: { $gt: date.toISOString() },
    }).count();

    if (reportsNumber >= limit) {
        ctx.reply(getMessage(ctx));
        return;
    }
    await next();
    const report = ctx.state.report;
    reportsNumber++;
    if (report) {
        await Report.create(report);
        if (reportsNumber >= limit) {
            ctx.reply(getMessage(ctx));
        } else {
            ctx.reply(`Осталось ${limit - reportsNumber}/${limit} запросов`);
        }
    }
};
