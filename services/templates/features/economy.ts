export const SELL_FEATURE_CODE = `import { config } from "../core/config.js";
import { addMoney } from "../core/economy.js";

export function sellAll(player) {
    const inv = player.getComponent("inventory").container;
    let total = 0;
    let soldCount = 0;
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
        addMoney(player, total);
        return { success: true, msg: \`§aVendido \${soldCount} itens por \${config.economy.currencySymbol}\${total}\` };
    }
    return { success: false, msg: "§cNada para vender." };
}
`;

export const SHOP_FEATURE_CODE = `import { ItemStack, EnchantmentTypes } from "@minecraft/server";
import { config } from "../core/config.js";
import { getBalance, removeMoney } from "../core/economy.js";

const CATEGORIES = ["Ferramentas", "Armaduras", "Blocos", "Farms", "Máquinas", "Outros"];

export function getShopCategories() { 
    const present = [...new Set(config.shop.map(i => i.category || "Outros"))];
    return present.length > 0 ? present : CATEGORIES;
}

export function getItemsByCategory(category) {
    if (!config.shop) return [];
    return config.shop.filter(item => (item.category || "Outros") === category);
}

export function buyShopItem(player, itemId) {
    const itemConfig = config.shop.find(i => i.id === itemId);
    if (!itemConfig) return { success: false, msg: "§cItem não existe." };
    const cost = itemConfig.price;
    if (getBalance(player) < cost) return { success: false, msg: \`§cSem saldo.\` };
    const inv = player.getComponent("inventory").container;
    if (inv.emptySlotsCount === 0) return { success: false, msg: "§cInventário cheio." };

    const itemStack = new ItemStack(itemConfig.itemType, itemConfig.amount || 1);
    if (itemConfig.name) itemStack.nameTag = itemConfig.name;
    if (itemConfig.enchantments && itemConfig.enchantments.length > 0) {
        const enchantable = itemStack.getComponent("minecraft:enchantable");
        if (enchantable) {
            for (const ench of itemConfig.enchantments) {
                try {
                    const type = EnchantmentTypes.get(ench.type);
                    if (type) enchantable.addEnchantment({ type: type, level: ench.level });
                } catch (e) {}
            }
        }
    }
    removeMoney(player, cost);
    inv.addItem(itemStack);
    return { success: true, msg: \`§aComprado!\` };
}
`;