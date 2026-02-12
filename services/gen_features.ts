import { AddonConfig, GeneratedFile } from "../types";
import { RANK_FEATURE_CODE } from "./templates/features/ranks";
import { MINES_FEATURE_CODE, AUTO_RESET_CODE } from "./templates/features/mines";
import { MACHINES_FEATURE_CODE } from "./templates/features/machines";
import { SELL_FEATURE_CODE, SHOP_FEATURE_CODE } from "./templates/features/economy";
import { PLOTS_FEATURE_CODE } from "./templates/features/plots";
import { NPCS_FEATURE_CODE } from "./templates/features/npcs";
import { BANK_FEATURE_CODE } from "./templates/features/bank";
import { getBoosterEndTime, activateBooster, getSellMultiplier, getMachineMultiplier } from "./templates/features/boosters";
import { checkAndResetMissions, incrementMissionProgress, getMissionStatus, claimMissionReward } from "./templates/features/missions";
import { logAdminAction, checkSellLimit } from "./templates/features/security";

// Helper for exporting strings
const BOOSTERS_CODE = `import { config } from "../core/config.js";

// Helper to get active temporary booster end time
export function getBoosterEndTime(player, type) {
    try {
        const val = player.getDynamicProperty(\`booster_\${type}_end\`);
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
        player.setDynamicProperty(\`booster_\${type}_end\`, newEnd);
        return { success: true, msg: \`§aBooster \${booster.name} ativado! Duração estendida.\` };
    } catch (e) {
        return { success: false, msg: "Erro ao ativar booster." };
    }
}

export function getSellMultiplier(player) {
    if (!config.boosters.enabled) return 1.0;
    
    let multiplier = config.boosters.globalMultiplier || 1.0;
    
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
`;

const MISSIONS_CODE = `import { config } from "../core/config.js";
import { addMoney } from "../core/economy.js";
import { ItemStack } from "@minecraft/server";
import { activateBooster } from "./boosters.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

// Keys for Dynamic Properties
// p_m_{id} -> Current Progress (Int)
// c_m_{id} -> Claimed (Boolean/1 or 0)
// t_reset_d -> Last Daily Reset Timestamp
// t_reset_w -> Last Weekly Reset Timestamp

export function checkAndResetMissions(player) {
    if (!config.missions || !config.missions.enabled) return;
    
    const now = Date.now();
    
    // Check Daily
    const lastDaily = player.getDynamicProperty("t_reset_d") || 0;
    if (now - lastDaily > DAY_MS) {
        // Reset all daily missions
        config.missions.list.filter(m => m.period === "daily").forEach(m => {
            player.setDynamicProperty(\`p_\${m.id}\`, 0);
            player.setDynamicProperty(\`c_\${m.id}\`, 0);
        });
        player.setDynamicProperty("t_reset_d", now);
        player.sendMessage("§e§lMISSÕES DIÁRIAS RESETADAS!");
    }

    // Check Weekly
    const lastWeekly = player.getDynamicProperty("t_reset_w") || 0;
    if (now - lastWeekly > WEEK_MS) {
        // Reset all weekly missions
        config.missions.list.filter(m => m.period === "weekly").forEach(m => {
            player.setDynamicProperty(\`p_\${m.id}\`, 0);
            player.setDynamicProperty(\`c_\${m.id}\`, 0);
        });
        player.setDynamicProperty("t_reset_w", now);
        player.sendMessage("§e§lMISSÕES SEMANAIS RESETADAS!");
    }
}

export function incrementMissionProgress(player, type, amount = 1) {
    if (!config.missions || !config.missions.enabled) return;
    checkAndResetMissions(player);

    const relevantMissions = config.missions.list.filter(m => m.type === type);
    
    relevantMissions.forEach(m => {
        const current = player.getDynamicProperty(\`p_\${m.id}\`) || 0;
        const claimed = player.getDynamicProperty(\`c_\${m.id}\`);
        
        // Don't update if already claimed
        if (claimed) return;
        
        // Only update if not completed to avoid spam writing DB
        if (current < m.target) {
            const newVal = current + amount;
            player.setDynamicProperty(\`p_\${m.id}\`, newVal);
            if (newVal >= m.target) {
                player.sendMessage(\`§a§lMISSÃO CONCLUÍDA! §r§f\${m.name} §7(Abra o menu para resgatar)\`);
            }
        }
    });
}

export function getMissionStatus(player, missionId) {
    const m = config.missions.list.find(x => x.id === missionId);
    if (!m) return null;
    
    const progress = player.getDynamicProperty(\`p_\${m.id}\`) || 0;
    const claimed = !!player.getDynamicProperty(\`c_\${m.id}\`);
    
    return {
        progress: Math.min(progress, m.target),
        target: m.target,
        completed: progress >= m.target,
        claimed: claimed
    };
}

export function claimMissionReward(player, missionId) {
    const status = getMissionStatus(player, missionId);
    if (!status) return { success: false, msg: "Missão inválida." };
    if (!status.completed) return { success: false, msg: "Ainda não concluída." };
    if (status.claimed) return { success: false, msg: "Já resgatada." };
    
    const m = config.missions.list.find(x => x.id === missionId);
    
    // Give Reward
    if (m.rewardType === 'money') {
        addMoney(player, m.rewardValue);
    } else if (m.rewardType === 'item') {
        const inv = player.getComponent("inventory").container;
        if (inv.emptySlotsCount > 0 && m.rewardId) {
             const item = new ItemStack(m.rewardId, m.rewardValue || 1);
             inv.addItem(item);
        } else {
             return { success: false, msg: "§cInventário cheio!" };
        }
    } else if (m.rewardType === 'booster') {
        if (m.rewardId) {
            activateBooster(player, m.rewardId);
        }
    }

    // Mark claimed
    player.setDynamicProperty(\`c_\${m.id}\`, 1);
    
    return { success: true, msg: "§aRecompensa resgatada!" };
}
`;

const SECURITY_CODE = `import { world, system } from "@minecraft/server";
import { config } from "../core/config.js";

// Rate Limiting Cache
const SELL_CACHE = new Map();

export function logAdminAction(player, action) {
    if (!config.protection || !config.protection.adminLogs) return;
    
    // Broadcast to admins
    const msg = \`§7[LOG] §e\${player.name} §f\${action}\`;
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
`;

export const generateFeatures = (config: AddonConfig): GeneratedFile[] => {
  const files: GeneratedFile[] = [];

  // RANKS
  files.push({
    path: "scripts/features/ranks.js",
    content: RANK_FEATURE_CODE
  });

  // MINES
  files.push({
    path: "scripts/features/mines.js",
    content: MINES_FEATURE_CODE
  });

  // AUTO RESET
  files.push({
    path: "scripts/features/autoReset.js",
    content: AUTO_RESET_CODE
  });

  // MACHINES
  files.push({
    path: "scripts/features/machines.js",
    content: MACHINES_FEATURE_CODE
  });

  // SELL
  files.push({
    path: "scripts/features/sell.js",
    content: SELL_FEATURE_CODE
  });

  // SHOP
  files.push({
    path: "scripts/features/shop.js",
    content: SHOP_FEATURE_CODE
  });

  // PLOTS
  files.push({
    path: "scripts/features/plots.js",
    content: PLOTS_FEATURE_CODE
  });

  // NPCS
  files.push({
    path: "scripts/features/npcs.js",
    content: NPCS_FEATURE_CODE
  });

  // BANK
  if (config.bank && config.bank.enabled) {
      files.push({
        path: "scripts/features/bank.js",
        content: BANK_FEATURE_CODE
      });
  }

  // BOOSTERS
  if (config.boosters && config.boosters.enabled) {
      files.push({
        path: "scripts/features/boosters.js",
        content: BOOSTERS_CODE
      });
  }

  // MISSIONS
  if (config.missions && config.missions.enabled) {
      files.push({
        path: "scripts/features/missions.js",
        content: MISSIONS_CODE
      });
  }

  // SECURITY
  if (config.protection && config.protection.enabled) {
      files.push({
        path: "scripts/features/security.js",
        content: SECURITY_CODE
      });
  }

  return files;
};