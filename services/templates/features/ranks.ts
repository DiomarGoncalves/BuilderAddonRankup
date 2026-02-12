export const RANK_FEATURE_CODE = `import { config } from "../core/config.js";
import { getBalance, removeMoney } from "../core/economy.js";
import { world } from "@minecraft/server";

export function getPlayerRank(player) {
    for (let i = config.ranks.length - 1; i >= 0; i--) {
        if (player.hasTag(config.ranks[i].id)) return config.ranks[i];
    }
    return config.ranks[0];
}

export function getNextRank(currentRank) {
    const idx = config.ranks.findIndex(r => r.id === currentRank.id);
    if (idx === -1 || idx === config.ranks.length - 1) return null;
    return config.ranks[idx + 1];
}

export function buyNextRank(player) {
    const current = getPlayerRank(player);
    const next = getNextRank(current);
    if (!next) return { success: false, msg: "§cMax Rank!" };

    const bal = getBalance(player);
    if (bal < next.price) return { success: false, msg: \`§cFalta \${config.economy.currencySymbol}\${next.price - bal}\` };

    removeMoney(player, next.price);
    player.addTag(next.id);
    world.sendMessage(\`§e\${player.name} §fupou para §b\${next.name}§f!\`);
    return { success: true, msg: "§aSucesso!" };
}
`;