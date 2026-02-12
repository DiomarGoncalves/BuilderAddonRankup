export const ADMIN_MENU_CODE = `import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { config } from "../../core/config.js";
import { NPC_TYPES, spawnNPC } from "../../features/npcs.js";
import { resetMine } from "../../features/mines.js";
import { activateBooster } from "../../features/boosters.js";
import { logAdminAction } from "../../features/security.js";
import { world } from "@minecraft/server";

export function openAdminMenu(player) {
    if (!player.hasTag("admin")) return;
    
    new ActionFormData()
        .title("§cPAINEL ADMIN")
        .button("§lSPAWNAR NPC\\n§r§7Criar NPC no local", "textures/items/egg_npc")
        .button("§lRESETAR MINAS\\n§r§7Forçar reset agora", "textures/ui/refresh")
        .button("§lDAR BOOSTER\\n§r§7Ativar booster para player", "textures/items/potion_bottle_splash_heal")
        .button("§cVoltar", "textures/ui/cancel")
        .show(player).then(res => {
            if (res.canceled) return;
            if (res.selection === 0) openNPCSpawnMenu(player);
            if (res.selection === 1) {
                 config.ranks.forEach(rank => {
                    if (rank.mine) resetMine(rank.mine, player.dimension);
                 });
                 player.sendMessage("§a[ADMIN] Todas as minas foram resetadas.");
                 logAdminAction(player, "forçou reset das minas.");
            }
            if (res.selection === 2) openGiveBoosterMenu(player);
        });
}

function openNPCSpawnMenu(player) {
    const form = new ActionFormData().title("§cSPAWNAR NPC");
    const types = Object.keys(NPC_TYPES);
    
    types.forEach(key => {
        form.button(NPC_TYPES[key]);
    });

    form.show(player).then(res => {
        if (res.canceled) return;
        const type = types[res.selection];
        const result = spawnNPC(player, type);
        player.sendMessage(result.msg);
        if (result.success) logAdminAction(player, \`spawnou NPC \${type}.\`);
    });
}

function openGiveBoosterMenu(player) {
    const players = world.getPlayers();
    const playerNames = players.map(p => p.name);
    const boosters = config.boosters.items;
    const boosterNames = boosters.map(b => b.name);
    
    if (playerNames.length === 0) { player.sendMessage("§cSem jogadores."); return; }
    if (boosters.length === 0) { player.sendMessage("§cSem boosters configurados."); return; }

    new ModalFormData()
        .title("DAR BOOSTER")
        .dropdown("Jogador", playerNames)
        .dropdown("Booster", boosterNames)
        .show(player).then(res => {
            if (res.canceled) return;
            const target = players[res.formValues[0]];
            const boosterId = boosters[res.formValues[1]].id;
            
            if (target) {
                const result = activateBooster(target, boosterId);
                player.sendMessage(result.msg);
                if (result.success) {
                    target.sendMessage("§a§lVOCÊ RECEBEU UM BOOSTER!");
                    logAdminAction(player, \`deu booster para \${target.name}.\`);
                }
            }
        });
}
`;