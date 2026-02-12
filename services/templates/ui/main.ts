export const MAIN_MENU_CODE = `import { ActionFormData } from "@minecraft/server-ui";
import { config } from "../../core/config.js";
import { sellAll } from "../features/sell.js";
import { openRankUpMenu } from "./menus/rank.js";
import { openMinesMenu } from "./menus/mine.js";
import { openShopCategories } from "./menus/shop.js";
import { openPlotsMenu } from "./menus/plot.js";
import { openBankMenu } from "./menus/bank.js";
import { openAdminMenu } from "./menus/admin.js";
// Optional imports
import { openBoostersMenu } from "./menus/boosters.js";
import { openMissionsMenu } from "./menus/missions.js";

export function openMainMenu(player) {
    const form = new ActionFormData()
        .title("§lMENU PRINCIPAL")
        .body("§7Selecione uma opção abaixo:")
        .button("§6§lRANKUP\\n§r§7Evoluir Rank", "textures/items/diamond_pickaxe")
        .button("§b§lMINAS\\n§r§7Teleportar", "textures/items/iron_pickaxe")
        .button("§e§lLOJA\\n§r§7Comprar Itens", "textures/items/emerald")
        .button("§a§lVENDER TUDO\\n§r§7Inventário", "textures/items/gold_nugget")
        .button("§d§lTERRENOS\\n§r§7Sistema de Plots", "textures/blocks/grass_path_side");
    
    // Feature Toggles Check
    const bankEnabled = config.bank && config.bank.enabled;
    const boostersEnabled = config.boosters && config.boosters.enabled;
    const missionsEnabled = config.missions && config.missions.enabled;

    if (bankEnabled) form.button("§2§lBANCO\\n§r§7Depósitos e Saques", "textures/items/emerald");
    if (boostersEnabled) form.button("§e§lBOOSTERS\\n§r§7Multiplicadores", "textures/items/potion_bottle_splash_heal");
    if (missionsEnabled) form.button("§d§lMISSÕES\\n§r§7Tarefas & Quests", "textures/items/book_writable");

    form.button("§f§lSPAWN\\n§r§7Ir para o Início", "textures/items/bed_red");

    const isAdmin = player.hasTag("admin");
    if (isAdmin) {
        form.button("§c§lPAINEL ADMIN\\n§r§7Gerenciar", "textures/ui/op");
    }

    form.button("§c§lFECHAR", "textures/ui/cancel");

    form.show(player).then(response => {
        if (response.canceled) return;
        
        const selection = response.selection;

        // Base Indexes: 0..4 (Rank, Mines, Shop, Sell, Plots) are fixed.
        let index = 5;

        // Dynamic Buttons
        if (bankEnabled) {
            if (selection === index) { openBankMenu(player); return; }
            index++;
        }

        if (boostersEnabled) {
            if (selection === index) { openBoostersMenu(player); return; }
            index++;
        }

        if (missionsEnabled) {
            if (selection === index) { openMissionsMenu(player); return; }
            index++;
        }

        // Spawn
        if (selection === index) { 
            player.runCommandAsync("effect @s clear");
            player.runCommandAsync("tp @s 0 100 0");
            return; 
        }
        index++;

        // Admin
        if (isAdmin && selection === index) {
            openAdminMenu(player);
            return;
        }
        
        // Static mappings
        if (selection === 0) openRankUpMenu(player);
        else if (selection === 1) openMinesMenu(player);
        else if (selection === 2) openShopCategories(player);
        else if (selection === 3) player.sendMessage(sellAll(player).msg);
        else if (selection === 4) openPlotsMenu(player);
    });
}
`;