import { Markup, Telegraf } from "telegraf";

import User from "../models/User.js";
import { roles } from "../config/roles.js";

const publicRoles = roles.filter(({ isPublic }) => isPublic);

const setRole = (id: number, role: string) => User.findOneAndUpdate({ id }, { role }, { upsert: true });

export const start = (bot: Telegraf) => {
    bot.start((ctx) => {
        ctx.deleteMessage();
        ctx.reply(
            "Привет! Я бот для анализа торгов. Выберите свою роль:",
            Markup.inlineKeyboard(publicRoles.map(({ title, name }) => Markup.button.callback(title, `set_${name}`)))
        );
    });

    publicRoles.forEach((role) => {
        bot.action(`set_${role.name}`, async (ctx) => {
            await setRole(ctx.from.id, role.name);
            ctx.answerCbQuery(`Вы выбрали роль "${role.title}".`);
            ctx.deleteMessage();
            ctx.reply("Теперь вы можете запросить отчёт");
        });
    });
};
