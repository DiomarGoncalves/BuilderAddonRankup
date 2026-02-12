import { system, world } from "@minecraft/server";
import { config } from "../core/config.js";
import { getBalance } from "../core/economy.js";
import { getPlayerRank, getNextRank } from "../features/ranks.js";
import { mineAt, resetMine } from "../features/mines.js";
import { machinesTick } from "../features/machines.js";

// Helper to get current time in seconds
const nowSec = () => Math.floor(Date.now() / 1000);

export function startLoops() {
  // ==========================================================
  // LOOP 1: HUD, Haste, Machines (20 Ticks = 1 Second)
  // ==========================================================
  system.runInterval(() => {
    // 1. Player Loop (HUD + Haste)
    try {
      const players = world.getPlayers();
      for (const player of players) {
        if (!player.isValid()) continue;

        // --- HUD (Actionbar) ---
        try {
          const balance = getBalance(player);
          const currentRank = getPlayerRank(player);
          const nextRank = getNextRank(currentRank);
          
          let nextCostStr = "MAX";
          if (nextRank) {
            nextCostStr = `${config.economy.currencySymbol}${nextRank.price}`;
          }

          const hudText = `§6§l${config.serverName}§r\n§fMoney: §a${config.economy.currencySymbol}${balance} §7| §fRank: §b${currentRank.name} §7>> §e${nextCostStr}`;
          
          player.onScreenDisplay.setActionBar(hudText);
        } catch (err) {
          // Silent catch
        }

        // --- Haste in Mines ---
        try {
          const mine = mineAt(config, player.location); // removed dim arg, verify impl
          
          if (mine && mine.regionEffects !== false) {
            player.addEffect(mine.effectType || "haste", 40, {
              amplifier: mine.hasteAmplifier,
              showParticles: false
            });
          }
        } catch (err) {}
      }
    } catch (e) {
      console.warn(`Error in Player Loop: ${e}`);
    }

    // 2. Machines Tick
    try {
       machinesTick(); 
    } catch (e) {
      console.warn(`Error in Machines Loop: ${e}`);
    }

  }, 20);

  // ==========================================================
  // LOOP 2: Mine Reset Check (200 Ticks = 10 Seconds)
  // ==========================================================
  system.runInterval(() => {
    try {
      const currentTime = nowSec();

      // Iterate all ranks to check their mines
      for (const rank of config.ranks) {
        if (!rank.mine) continue;
        const mine = rank.mine;

        // Initialize nextResetAt if missing (first run)
        if (typeof mine.nextResetAt === 'undefined') {
          mine.nextResetAt = currentTime + mine.resetTime;
        }

        // Check if it's time to reset
        if (mine.nextResetAt <= currentTime) {
          // Reset the mine
          resetMine(mine).catch(err => {
            console.warn(`Failed to auto-reset mine ${rank.name}: ${err}`);
          });

          // Schedule next reset
          mine.nextResetAt = currentTime + mine.resetTime;
        }
      }
    } catch (e) {
      console.warn(`Error in Mine Reset Loop: ${e}`);
    }
  }, 200);
}