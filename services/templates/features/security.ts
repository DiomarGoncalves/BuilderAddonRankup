import { world, system } from "@minecraft/server";
import { config } from "../core/config.js";

// Rate Limiting Cache
const SELL_CACHE = new Map();

export function logAdminAction(player, action) {
    if (!config.protection || !config.protection.adminLogs) return;
    
    // Broadcast to admins
    const msg = `§7[LOG] §e${player.name} §f${action}`;
    for (const p of world.getPlayers()) {
        if (p.hasTag("admin")) {
            p.sendMessage(msg);
        }
    }
}

export function checkSellLimit(player) {
    if (!config.protection || !config.protection.enabled) return true;
    
    const limit = config.protection.antiExploit.maxSellPerMinute;
    if (limit <= 0) return true; // Unlimited

    const now = Date.now();
    let data = SELL_CACHE.get(player.name);

    // Initialize or Reset window
    if (!data || (now - data.startTime) > 60000) {
        data = { startTime: now, count: 0 };
        SELL_CACHE.set(player.name, data);
    }

    if (data.count >= limit) {
        player.sendMessage("§c§lANTI-EXPLOIT! §r§7Aguarde para vender novamente.");
        return false;
    }

    data.count++;
    return true;
}
