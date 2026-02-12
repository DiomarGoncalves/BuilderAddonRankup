export const EVENTS_RUNTIME_CODE = `import { world, system, ItemStack } from "@minecraft/server";
import { checkPlotPermission } from "../features/plots.js";
import { handleNPCInteract, removeNPC } from "../features/npcs.js";
import { registerMachine, removeMachine } from "../features/machines.js";
import { mineAt } from "../features/mines.js";
import { logAdminAction } from "../features/security.js";
import { config } from "../core/config.js";
import { openMainMenu } from "../ui/menu.js";
import { incrementMissionProgress } from "../features/missions.js";

export function registerEvents() {
    // Menu
    world.afterEvents.itemUse.subscribe((ev) => {
        if (ev.itemStack.typeId === "minecraft:compass") openMainMenu(ev.source);
    });

    // Spawn Kit
    world.afterEvents.playerSpawn.subscribe((ev) => {
        if (ev.initialSpawn) {
            const inv = ev.player.getComponent("inventory").container;
            let has = false;
            for (let i = 0; i < inv.size; i++) { if (inv.getItem(i)?.typeId === "minecraft:compass") has = true; }
            if (!has) {
                const menu = new ItemStack("minecraft:compass");
                menu.nameTag = "§a§lMENU";
                menu.lockMode = "slot"; menu.keepOnDeath = true;
                inv.setItem(8, menu);
            }
        }
    });

    // NPC Interaction
    world.afterEvents.playerInteractWithEntity.subscribe((ev) => {
        const { player, target, itemStack } = ev;
        if (target.typeId === "minecraft:npc" && target.hasTag("ru_npc")) {
            if (player.isSneaking && itemStack?.typeId === "minecraft:stick" && player.hasTag("admin")) {
                player.sendMessage(removeNPC(player, target).msg);
                logAdminAction(player, "removeu um NPC.");
            } else system.run(() => handleNPCInteract(player, target));
        }
    });

    // --- PROTECTION SYSTEM (Interaction & Placement) ---
    
    // Using itemUseOn to prevent placement/interaction (Fixes 'subscribe of undefined' error)
    world.beforeEvents.itemUseOn.subscribe((ev) => {
        const { source: player, block } = ev;
        const protection = config.protection || { enabled: false };

        // 1. Plot Protection (First priority)
        if (!checkPlotPermission(player, block)) {
            ev.cancel = true;
            system.run(() => player.sendMessage("§c§lPROTEGIDO! §r§7Sem permissão no Plot."));
            return;
        }

        if (!protection.enabled) return;

        // 2. Mine Protection (Prevent placing blocks or interacting with mine blocks)
        if (protection.mineProtection) {
            const mine = mineAt(config, block.location);
            // If the block interacted with IS part of a mine
            if (mine && !protection.blockPlaceInMine) {
                if (!player.hasTag("admin")) {
                    ev.cancel = true;
                    // Suppress spam unless checking specifically
                    if (ev.itemStack && ev.itemStack.typeId.includes("block")) {
                         system.run(() => player.sendMessage("§cProteção de Mina: Proibido construir aqui."));
                    }
                }
            }
        }
    });

    // Block Break Protection
    world.beforeEvents.playerBreakBlock.subscribe((ev) => {
        const { player, block } = ev;
        const protection = config.protection || { enabled: false };
        
        // 1. Plot Protection
        if (!checkPlotPermission(player, block)) {
            ev.cancel = true;
            system.run(() => player.sendMessage("§c§lPROTEGIDO! §r§7Sem permissão no Plot."));
            return;
        }

        if (!protection.enabled) return;

        // 2. Mine Protection
        if (protection.mineProtection) {
             const mine = mineAt(config, block.location);
             if (mine) {
                 // Allow breaking if it is the ore block
                 const isOre = mine.oreBlock && (block.typeId === mine.oreBlock || block.typeId.includes("ore"));
                 
                 // If not ore (walls/floor), cancel
                 if (!isOre && !player.hasTag("admin")) {
                     ev.cancel = true;
                     system.run(() => player.sendMessage("§cProteção de Mina: Apenas minérios podem ser quebrados."));
                     return;
                 }
             }
        }
    });

    // --- MACHINES & MISSIONS SYSTEM ---

    // Note: playerPlaceBlock in afterEvents IS VALID for registration (logic), just not protection (cancellation).
    world.afterEvents.playerPlaceBlock.subscribe((ev) => {
        const mConfig = config.machines.find(m => m.blockId === ev.block.typeId);
        if (mConfig) {
             registerMachine(ev.player, ev.block, mConfig.id);
             logAdminAction(ev.player, \`colocou uma Máquina (\${mConfig.name})\`);
        }
    });

    world.afterEvents.playerBreakBlock.subscribe((ev) => {
        // Machine removal check
        if (removeMachine(ev.block)) {
            ev.player.sendMessage("§eMáquina removida.");
            // logAdminAction(ev.player, "quebrou uma Máquina."); 
            return;
        }

        // Mission: Mine
        if (ev.player.getGameMode() === 'survival') {
            incrementMissionProgress(ev.player, "mine", 1);
        }
    });
}
`;