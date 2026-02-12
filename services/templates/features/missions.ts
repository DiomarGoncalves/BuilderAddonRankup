import { config } from "../core/config.js";
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
            player.setDynamicProperty(`p_${m.id}`, 0);
            player.setDynamicProperty(`c_${m.id}`, 0);
        });
        player.setDynamicProperty("t_reset_d", now);
        player.sendMessage("§e§lMISSÕES DIÁRIAS RESETADAS!");
    }

    // Check Weekly
    const lastWeekly = player.getDynamicProperty("t_reset_w") || 0;
    if (now - lastWeekly > WEEK_MS) {
        // Reset all weekly missions
        config.missions.list.filter(m => m.period === "weekly").forEach(m => {
            player.setDynamicProperty(`p_${m.id}`, 0);
            player.setDynamicProperty(`c_${m.id}`, 0);
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
        const current = player.getDynamicProperty(`p_${m.id}`) || 0;
        const claimed = player.getDynamicProperty(`c_${m.id}`);
        
        // Don't update if already claimed or capped (optional cap, usually good to let track high scores)
        if (claimed) return;
        
        // Only update if not completed to avoid spam writing DB
        if (current < m.target) {
            const newVal = current + amount;
            player.setDynamicProperty(`p_${m.id}`, newVal);
            if (newVal >= m.target) {
                player.sendMessage(`§a§lMISSÃO CONCLUÍDA! §r§f${m.name} §7(Abra o menu para resgatar)`);
            }
        }
    });
}

export function getMissionStatus(player, missionId) {
    const m = config.missions.list.find(x => x.id === missionId);
    if (!m) return null;
    
    const progress = player.getDynamicProperty(`p_${m.id}`) || 0;
    const claimed = !!player.getDynamicProperty(`c_${m.id}`);
    
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
    player.setDynamicProperty(`c_${m.id}`, 1);
    
    return { success: true, msg: "§aRecompensa resgatada!" };
}
