export const MAIN_MENU_CODE = `import { ActionFormData } from "@minecraft/server-ui";
import { sellAll } from "../features/sell.js";
import { openRankUpMenu } from "./menus/rank.js";
import { openMinesMenu } from "./menus/mine.js";
import { openShopCategories } from "./menus/shop.js";
import { openPlotsMenu } from "./menus/plot.js";
import { openBankMenu } from "./menus/bank.js";
import { openAdminMenu } from "./menus/admin.js";

export function openMainMenu(player) {
    const form = new ActionFormData()
        .title("§lMENU PRINCIPAL")
        .body("§7Selecione uma opção abaixo:")
        .button("§6§lRANKUP\\n§r§7Evoluir Rank", "textures/items/diamond_pickaxe")
        .button("§b§lMINAS\\n§r§7Teleportar", "textures/items/iron_pickaxe")
        .button("§e§lLOJA\\n§r§7Comprar Itens", "textures/items/emerald")
        .button("§a§lVENDER TUDO\\n§r§7Inventário", "textures/items/gold_nugget")
        .button("§d§lTERRENOS\\n§r§7Sistema de Plots", "textures/blocks/grass_path_side")
        .button("§2§lBANCO\\n§r§7Transferências", "textures/items/emerald") 
        .button("§f§lSPAWN\\n§r§7Ir para o Início", "textures/items/bed_red");

    const isAdmin = player.hasTag("admin");
    if (isAdmin) {
        form.button("§c§lPAINEL ADMIN\\n§r§7Gerenciar", "textures/ui/op");
    }

    form.button("§c§lFECHAR", "textures/ui/cancel");

    form.show(player).then(response => {
        if (response.canceled) return;
        
        // Mapeamento dos botões
        if (response.selection === 0) openRankUpMenu(player);
        if (response.selection === 1) openMinesMenu(player);
        if (response.selection === 2) openShopCategories(player);
        if (response.selection === 3) player.sendMessage(sellAll(player).msg);
        if (response.selection === 4) openPlotsMenu(player);
        if (response.selection === 5) openBankMenu(player);
        
        // Spawn - Limpa efeitos (Haste) e teleporta
        if (response.selection === 6) {
            player.runCommandAsync("effect @s clear");
            player.runCommandAsync("tp @s 0 100 0");
        }
        
        if (isAdmin && response.selection === 7) openAdminMenu(player);
    });
}
`;