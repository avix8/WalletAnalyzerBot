import { Context, MiddlewareFn } from "telegraf";

import User from "../models/User.js";
import { limits } from "../config/roles.js";

export const role: MiddlewareFn<Context> = async (ctx, next) => {
    const user = await User.findOne({ id: ctx.from.id });
    if (user === null) {
        return;
    }
    ctx.state.userRole = user.role;
    ctx.state.reportLimit = limits[user.role];
    next();
};
