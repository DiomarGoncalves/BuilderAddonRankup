export const BANK_FEATURE_CODE = `import { world } from "@minecraft/server";
import { config } from "../core/config.js";
import { getBalance, addMoney, removeMoney } from "../core/economy.js";

const BANK_OBJ_ID = "ru_bank";

function getBankObjective() {
    let obj = world.scoreboard.getObjective(BANK_OBJ_ID);
    if (!obj) obj = world.scoreboard.addObjective(BANK_OBJ_ID, "Bank Balance");
    return obj;
}

export function getBankBalance(player) {
    try {
        const score = getBankObjective().getScore(player);
        return score ?? 0;
    } catch {
        return 0;
    }
}

export function depositMoney(player, amount) {
    if (amount <= 0) return { success: false, msg: "§cValor inválido." };
    
    const wallet = getBalance(player);
    if (wallet < amount) return { success: false, msg: "§cDinheiro na carteira insuficiente." };

    removeMoney(player, amount);
    getBankObjective().addScore(player, amount);
    
    return { success: true, msg: \`§aDepositado \${config.economy.currencySymbol}\${amount} no banco.\` };
}

export function withdrawMoney(player, amount) {
    if (amount <= 0) return { success: false, msg: "§cValor inválido." };

    const bankBal = getBankBalance(player);
    if (bankBal < amount) return { success: false, msg: "§cSaldo no banco insuficiente." };

    const currentBank = getBankBalance(player);
    getBankObjective().setScore(player, currentBank - amount);
    addMoney(player, amount);
    
    return { success: true, msg: \`§aSacado \${config.economy.currencySymbol}\${amount} do banco.\` };
}
`;