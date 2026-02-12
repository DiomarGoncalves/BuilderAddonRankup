export const ADMIN_MENU_CODE = `import { ActionFormData } from "@minecraft/server-ui";
import { config } from "../../core/config.js";
import { NPC_TYPES, spawnNPC } from "../../features/npcs.js";
import { resetMine } from "../../features/mines.js";

export function openAdminMenu(player) {
    if (!player.hasTag("admin")) return;
    
    new ActionFormData()
        .title("§cPAINEL ADMIN")
        .button("§lSPAWNAR NPC\\n§r§7Criar NPC no local", "textures/items/egg_npc")
        .button("§lRESETAR MINAS\\n§r§7Forçar reset agora", "textures/ui/refresh")
        .button("§cVoltar", "textures/ui/cancel")
        .show(player).then(res => {
            if (res.canceled) return;
            if (res.selection === 0) openNPCSpawnMenu(player);
            if (res.selection === 1) {
                 config.ranks.forEach(rank => {
                    if (rank.mine) resetMine(rank.mine, player.dimension);
                 });
                 player.sendMessage("§a[ADMIN] Todas as minas foram resetadas.");
            }
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
    });
}
`;