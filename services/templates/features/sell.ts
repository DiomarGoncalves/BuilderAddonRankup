import { config } from "../core/config.js";
import { addMoney } from "../core/economy.js";
import { getSellMultiplier } from "./boosters.js";
import { incrementMissionProgress } from "./missions.js";
import { checkSellLimit } from "./security.js";

export function sellAll(player) {
    if (!checkSellLimit(player)) return { success: false, msg: "" };

    const inv = player.getComponent("inventory").container;
    let total = 0;
    let soldCount = 0;
    
    const multiplier = config.boosters && config.boosters.enabled ? getSellMultiplier(player) : 1.0;

    for (let i = 0; i < inv.size; i++) {
        const item = inv.getItem(i);
        if (!item) continue;
        const sellData = config.sellItems.find(s => s.itemType === item.typeId);
        if (sellData) {
            const price = sellData.pricePerUnit * item.amount;
            total += price;
            soldCount += item.amount;
            inv.setItem(i, undefined);
        }
    }
    
    if (total > 0) {
        const finalTotal = Math.floor(total * multiplier);
        addMoney(player, finalTotal);
        
        incrementMissionProgress(player, "sell", soldCount);
        
        let msg = \`§aVendido \${soldCount} itens por \${config.economy.currencySymbol}\${finalTotal}\`;
        if (multiplier > 1.0) {
            msg += \` §e(Mult: \${multiplier.toFixed(1)}x)\`;
        }
        return { success: true, msg: msg };
    }
    return { success: false, msg: "§cNada para vender." };
}
