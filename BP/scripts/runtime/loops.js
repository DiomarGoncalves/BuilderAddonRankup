import { system, world } from "@minecraft/server";
import { config } from "../core/config.js";
import { getBalance } from "../core/economy.js";
import { getPlayerRank, getNextRank } from "../features/ranks.js";
import { mineAt, resetMine } from "../features/mines.js";

// Import machinesTick if it exists, otherwise we define a placeholder to prevent crash during dev
// In a full generation, this file would exist.
// import { machinesTick } from "../features/machines.js";

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
            // Simple formatter for numbers (k, m) could be added in util, using raw here
            nextCostStr = `${config.economy.currencySymbol}${nextRank.price}`;
          }

          const hudText = `§6§l${config.serverName}§r\n§fMoney: §a${config.economy.currencySymbol}${balance} §7| §fRank: §b${currentRank.name} §7>> §e${nextCostStr}`;
          
          player.onScreenDisplay.setActionBar(hudText);
        } catch (err) {
          // Silent catch for HUD errors to avoid console spam
        }

        // --- Haste in Mines ---
        try {
          // Check if player is inside any defined mine
          // We pass 'config' because mineAt iterates config.ranks
          const mine = mineAt(config, player.location, player.dimension.id);
          
          if (mine) {
            // Apply Haste: 8 ticks duration (0.4s) to ensure it stays active but clears quickly if they leave
            // Amplifier: 0 = Haste I, 1 = Haste II, etc.
            // showParticles: false
            player.addEffect("haste", 8, {
              amplifier: mine.hasteAmplifier,
              showParticles: false
            });
          }
        } catch (err) {
           // Player might be dead or dimension invalid
        }
      }
    } catch (e) {
      console.warn(`Error in Player Loop: ${e}`);
    }

    // 2. Machines Tick (Placeholder)
    try {
      // machinesTick(); 
      // Uncomment the line above once features/machines.js is implemented
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
            console.warn(`Failed to auto-reset mine ${mine.name}: ${err}`);
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
