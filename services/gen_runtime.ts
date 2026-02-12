import { AddonConfig, GeneratedFile } from "../types";

export const generateRuntime = (config: AddonConfig): GeneratedFile[] => {
  const files: GeneratedFile[] = [];

  // LOOPS
  files.push({
    path: "scripts/runtime/loops.js",
    content: `import { system, world } from "@minecraft/server";
import { config } from "../core/config.js";
import { machinesTick } from "../features/machines.js";
import { getPlotIdAt, getPlotOwner, getPlotMembers, getSafeKickLocation } from "../features/plots.js";
import { initGlobalSidebar } from "../core/display.js";
import { getBalance } from "../core/economy.js";
import { getPlayerRank, getNextRank } from "../features/ranks.js";
import { mineAt } from "../features/mines.js";

export function startLoops() {
  
  // 1. Inicializa a Sidebar Global uma única vez (ou periodicamente se necessário, mas sem remover)
  initGlobalSidebar();

  // 2. Loop Principal (HUD e Lógica de Jogador)
  system.runInterval(() => {
    for (const player of world.getPlayers()) {
        if (!player.isValid()) continue;

        // A. ACTION BAR (HUD PESSOAL)
        // Como a sidebar é global, usamos aqui para mostrar Money e Rank individual
        try {
            const balance = getBalance(player);
            const currentRank = getPlayerRank(player);
            const nextRank = getNextRank(currentRank);
            
            let nextInfo = "§aMAX";
            if (nextRank) {
                const diff = nextRank.price - balance;
                const progressColor = diff <= 0 ? "§a" : "§c";
                nextInfo = \`\${progressColor}\${config.economy.currencySymbol}\${nextRank.price}\`;
            }

            const hudText = \`§fRank: §b\${currentRank.name}  §7|  §fMoney: §a\${config.economy.currencySymbol}\${balance}  §7|  §fProx: \${nextInfo}\`;
            player.onScreenDisplay.setActionBar(hudText);
            
        } catch (e) {}

        // B. Haste Effect nas Minas
        try {
          const mine = mineAt(config, player.location);
          if (mine) {
            player.addEffect("haste", 20, {
              amplifier: mine.hasteAmplifier,
              showParticles: false
            });
          }
        } catch (err) {}

        // C. Controle de Acesso aos Plots
        const plotId = getPlotIdAt(player.location);
        if (plotId !== -1) {
            const owner = getPlotOwner(plotId);
            if (owner && owner !== player.name) {
                const members = getPlotMembers(plotId);
                if (!members.includes(player.name) && !player.hasTag("admin")) {
                    player.sendMessage(\`§c§lACESSO NEGADO!\\n§r§7Este terreno pertence a \${owner}.\`);
                    const kickLoc = getSafeKickLocation(plotId);
                    player.teleport(kickLoc);
                }
            }
        }
    }
  }, 20);

  // 3. Loop das Máquinas (1 segundo)
  system.runInterval(() => { machinesTick(); }, 20);
}
`
  });

  // EVENTS
  files.push({
    path: "scripts/runtime/events.js",
    content: `import { world, system, ItemStack } from "@minecraft/server";
import { checkPlotPermission } from "../features/plots.js";
import { handleNPCInteract, removeNPC } from "../features/npcs.js";
import { registerMachine, removeMachine } from "../features/machines.js";
import { config } from "../core/config.js";
import { openMainMenu } from "../ui/menu.js";

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
            } else system.run(() => handleNPCInteract(player, target));
        }
    });

    // --- PROTECTION SYSTEM ---
    
    world.beforeEvents.itemUseOn.subscribe((ev) => {
        if (!checkPlotPermission(ev.source, ev.block)) {
            ev.cancel = true;
            system.run(() => ev.source.sendMessage("§c§lPROTEGIDO! §r§7Sem permissão."));
        }
    });

    world.beforeEvents.playerBreakBlock.subscribe((ev) => {
        if (!checkPlotPermission(ev.player, ev.block)) {
            ev.cancel = true;
            system.run(() => ev.player.sendMessage("§c§lPROTEGIDO! §r§7Sem permissão."));
        }
    });

    // --- MACHINES SYSTEM ---

    world.afterEvents.playerPlaceBlock.subscribe((ev) => {
        const mConfig = config.machines.find(m => m.blockId === ev.block.typeId);
        if (mConfig) {
             registerMachine(ev.player, ev.block, mConfig.id);
        }
    });

    world.afterEvents.playerBreakBlock.subscribe((ev) => {
        if (removeMachine(ev.block)) {
            ev.player.sendMessage("§eMáquina removida.");
        }
    });
}
`
  });

  return files;
};