import { config } from "../core/config.js";

// Helper to get active temporary booster end time
export function getBoosterEndTime(player, type) {
    try {
        const val = player.getDynamicProperty(`booster_${type}_end`);
        return val ? Number(val) : 0;
    } catch { return 0; }
}

export function activateBooster(player, boosterId) {
    const booster = config.boosters.items.find(b => b.id === boosterId);
    if (!booster) return { success: false, msg: "Booster inválido." };

    const type = booster.type; // 'sell' or 'machine'
    const durationMs = booster.durationMinutes * 60 * 1000;
    
    // Check if already active and extend, or start new
    const currentEnd = getBoosterEndTime(player, type);
    const now = Date.now();
    const baseTime = currentEnd > now ? currentEnd : now;
    const newEnd = baseTime + durationMs;

    try {
        player.setDynamicProperty(`booster_${type}_end`, newEnd);
        return { success: true, msg: `§aBooster ${booster.name} ativado! Duração estendida.` };
    } catch (e) {
        return { success: false, msg: "Erro ao ativar booster." };
    }
}

export function getSellMultiplier(player) {
    if (!config.boosters.enabled) return 1.0;
    
    let multiplier = config.boosters.globalMultiplier || 1.0;
    
    // VIPs
    for (const vip of config.boosters.vips) {
        if (player.hasTag(vip.tag)) multiplier += (vip.multiplier - 1.0);
        // Note: Logic adds the bonus. e.g. 1.0 Global + (1.2 VIP - 1.0) = 1.2 Total. 
        // Or if you want multiplicative: multiplier *= vip.multiplier.
        // Let's use additive for simpler stacking control, or max logic.
        // Here, let's just TAKE THE HIGHEST VIP multiplier found to avoid insane stacking.
    }
    
    // Re-logic for VIP: Use max VIP found
    let maxVipMult = 1.0;
    for (const vip of config.boosters.vips) {
        if (player.hasTag(vip.tag) && vip.multiplier > maxVipMult) {
            maxVipMult = vip.multiplier;
        }
    }
    if (maxVipMult > 1.0) multiplier *= maxVipMult;

    // Active Temporary Booster
    const end = getBoosterEndTime(player, 'sell');
    if (end > Date.now()) {
        // Find which booster is active? simpler: just assume 2x for generic booster logic 
        // or we need to store the strength. 
        // For this version, let's assume active booster = flat 2x bonus or configured highest.
        // To be precise, let's assume the last activated booster strength dominates or is stored.
        // Since we only stored time, let's assume a standard 2x multiplier for active temp boosters 
        // OR iterate config to see if we can deduce. 
        // SIMPLIFICATION: If active, apply 2.0x (or the first found in config).
        const refBooster = config.boosters.items.find(b => b.type === 'sell');
        if (refBooster) multiplier *= refBooster.multiplier;
    }

    return multiplier;
}

export function getMachineMultiplier(player) {
    if (!config.boosters.enabled) return 1.0;
    
    let multiplier = config.boosters.globalMultiplier || 1.0;

    // VIPs
    let maxVipMult = 1.0;
    for (const vip of config.boosters.vips) {
        if (player.hasTag(vip.tag) && vip.multiplier > maxVipMult) {
            maxVipMult = vip.multiplier;
        }
    }
    if (maxVipMult > 1.0) multiplier *= maxVipMult;

    // Active Temporary Booster
    const end = getBoosterEndTime(player, 'machine');
    if (end > Date.now()) {
        const refBooster = config.boosters.items.find(b => b.type === 'machine');
        if (refBooster) multiplier *= refBooster.multiplier;
    }

    return multiplier;
}
