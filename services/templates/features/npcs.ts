export const NPCS_FEATURE_CODE = `import { world } from "@minecraft/server";
import { sellAll } from "./sell.js";
import { openShopCategories } from "../ui/menus/shop.js";
import { openMinesMenu } from "../ui/menus/mine.js";
import { openPlotsMenu } from "../ui/menus/plot.js";
import { openBankMenu } from "../ui/menus/bank.js";

export const NPC_TYPES = {
    "sell": "§a§lVENDER",
    "shop": "§e§lLOJA",
    "mines": "§b§lMINAS",
    "rankup": "§6§lRANKUP",
    "plots": "§d§lPLOTS",
    "bank": "§2§lBANCO"
};

export function spawnNPC(player, type) {
    if (!NPC_TYPES[type]) return { success: false, msg: "Tipo inválido." };
    try {
        const npc = player.dimension.spawnEntity("minecraft:npc", player.location);
        npc.nameTag = NPC_TYPES[type];
        npc.addTag("ru_npc");
        npc.addTag(\`ru_npc_type:\${type}\`);
        return { success: true, msg: "NPC Spawnado!" };
    } catch (e) { return { success: false, msg: \`Erro: \${e}\` }; }
}

export function removeNPC(player, entity) {
    if (!entity.hasTag("ru_npc")) return { success: false, msg: "Inválido." };
    entity.remove();
    return { success: true, msg: "NPC Removido." };
}

export function handleNPCInteract(player, entity) {
    const tags = entity.getTags();
    const typeTag = tags.find(t => t.startsWith("ru_npc_type:"));
    if (!typeTag) return;
    const type = typeTag.split(":")[1];
    switch(type) {
        case "sell": player.sendMessage(sellAll(player).msg); break;
        case "shop": openShopCategories(player); break;
        case "mines": openMinesMenu(player); break;
        case "plots": openPlotsMenu(player); break;
        case "rankup": player.sendMessage("§eUse o Menu."); break;
        case "bank": openBankMenu(player); break;
    }
}
`;