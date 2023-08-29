export type Role = {
    name: string;
    title: string;
    isPublic: boolean;
    dailyLimit: number;
};

export const roles: Role[] = [
    {
        name: "user",
        title: "Пользователь",
        isPublic: true,
        dailyLimit: 5,
    },
    {
        name: "analyst",
        title: "Аналитик",
        isPublic: true,
        dailyLimit: 20,
    },
];

export const limits = roles.reduce((acc: Record<string, number>, cur) => {
    acc[cur.name] = cur.dailyLimit;
    return acc;
}, {});
