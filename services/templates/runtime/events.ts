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

    // --- PROTECTION SYSTEM ---
    
    // Block Place
    world.beforeEvents.playerPlaceBlock.subscribe((ev) => {
        const { player, block } = ev;
        const protection = config.protection || { enabled: false };

        if (!protection.enabled) return;

        // 1. Mine Protection
        if (protection.mineProtection) {
            const mine = mineAt(config, block.location);
            if (mine && !protection.blockPlaceInMine) {
                if (!player.hasTag("admin")) {
                    ev.cancel = true;
                    system.run(() => player.sendMessage("§cProteção de Mina: Não pode colocar blocos aqui."));
                    return;
                }
            }
        }

        // 2. Plot Protection
        if (!checkPlotPermission(player, block)) {
            ev.cancel = true;
            system.run(() => player.sendMessage("§c§lPROTEGIDO! §r§7Sem permissão."));
        }
    });

    // Block Break
    world.beforeEvents.playerBreakBlock.subscribe((ev) => {
        const { player, block } = ev;
        const protection = config.protection || { enabled: false };
        
        if (!protection.enabled) return;

        // 1. Mine Protection
        if (protection.mineProtection) {
             const mine = mineAt(config, block.location);
             if (mine) {
                 // Check if it is the ore. If the mine config doesn't have an ore type (old format), we might skip this check 
                 // OR we extracted it in mineAt from fillCommands.
                 const isOre = mine.oreBlock && (block.typeId === mine.oreBlock || block.typeId.includes("ore"));
                 
                 // If it's NOT the ore (e.g. walls, floor), prevent break.
                 if (!isOre && !player.hasTag("admin")) {
                     ev.cancel = true;
                     system.run(() => player.sendMessage("§cProteção de Mina: Apenas minérios podem ser quebrados."));
                     return;
                 }
                 // If it IS the ore, allow it (do not return, let other checks run if any)
             }
        }

        // 2. Plot Protection
        if (!checkPlotPermission(player, block)) {
            ev.cancel = true;
            system.run(() => player.sendMessage("§c§lPROTEGIDO! §r§7Sem permissão."));
        }
    });

    // --- MACHINES & MISSIONS SYSTEM ---

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
            // logAdminAction(ev.player, "quebrou uma Máquina."); // Optional, might be spammy
            return;
        }

        // Mission: Mine
        if (ev.player.getGameMode() === 'survival') {
            incrementMissionProgress(ev.player, "mine", 1);
        }
    });
}
`;