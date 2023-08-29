import { Context } from "telegraf";
import ExcelJS from "exceljs";
import { config } from "dotenv-defaults";
import fetch from "node-fetch";
import { isAddress } from "ethers";

config();

const apiKey = process.env.API_KEY;

const columns = [
    { header: "Тикер монеты A", key: "coinA", width: 16 },
    { header: "Адрес контракта монеты A", key: "contractA", width: 44 },
    { header: "Тикер монеты B", key: "coinB", width: 16 },
    { header: "Адрес контракта монеты B", key: "contractB", width: 44 },
    { header: "Дата сделки", key: "date", width: 12 },
    { header: "Адрес контракта пула", key: "poolContract", width: 44 },
    { header: "Тип декса", key: "dexType", width: 20 },
    { header: "Хэш транзакции", key: "hash", width: 70 },
];

type Transaction = {
    hash: string;
    from: string;
    to: string;
    tokenName: string;
    contractAddress: string;
    timeStamp: string;
};

type SwapTransaction = {
    from?: Transaction;
    to?: Transaction;
};

const getBlockchainData = (module: string, action: string) => async (address: string) => {
    const response = await fetch(
        `https://api.etherscan.io/api?module=${module}&action=${action}&address=${address}&apikey=${apiKey}&sort=desc`
    );
    const data = (await response.json()) as {
        status: string;
        result: any;
        message: string;
    };

    return data.result;
};

const getERC20Transactions: (address: string) => Promise<Transaction[]> = getBlockchainData("account", "tokentx");
const getContract = getBlockchainData("contract", "getsourcecode");

const contractNames = new Map<string, Promise<string>>();
const getContractName = async (address: string) => {
    if (!contractNames.has(address)) {
        contractNames.set(
            address,
            getContract(address).then((res: { ContractName: string }[]) => res[0].ContractName)
        );
    }
    return contractNames.get(address);
};

export const sendReport = async (ctx: Context<any>) => {
    const [_, address, network] = ctx.message.text.split(" ");
    if (network !== "eth") {
        ctx.reply("В данный момент поддерживается только сеть Ethereum");
        return;
    }

    if (!isAddress(address)) {
        ctx.reply("Не валидный адрес");
        return;
    }
    ctx.state.report = { id: ctx.from.id, address, network };

    let transactions: Transaction[] = [];
    try {
        transactions = await getERC20Transactions(address);
    } catch (error) {
        ctx.reply("Произошла ошибка при получении транзакций.");
        console.error(error);
        return;
    }

    if (transactions.length === 0) {
        ctx.reply("Для этого адреса нет транзакций.");
        return;
    }

    const swaps = new Map<string, SwapTransaction>();
    transactions.forEach((transaction) => {
        const type = address === transaction.from ? "from" : "to";
        swaps.set(transaction.hash, {
            ...swaps.get(transaction.hash),
            [type]: transaction,
        });
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("transactions");
    worksheet.columns = columns;

    for (const [hash, swap] of swaps) {
        if (
            swap.to &&
            swap.from &&
            swap.to.from === swap.from.to &&
            swap.from.contractAddress !== swap.to.contractAddress
        ) {
            worksheet.addRow({
                coinA: swap.from.tokenName,
                contractA: swap.from.contractAddress,
                coinB: swap.to.tokenName,
                contractB: swap.to.contractAddress,
                date: new Date(parseInt(swap.from.timeStamp) * 1000),
                poolContract: swap.from.to,
                dexType: await getContractName(swap.from.to),
                hash,
            });
        }
    }
    const excelBuffer = await workbook.xlsx.writeBuffer();
    await ctx.replyWithDocument({
        source: Buffer.from(excelBuffer),
        filename: `${address} ${Date.now()}.xlsx`,
    });
};
