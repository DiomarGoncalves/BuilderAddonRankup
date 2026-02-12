export const RANK_MENU_CODE = `import { ActionFormData } from "@minecraft/server-ui";
import { config } from "../../core/config.js";
import { getPlayerRank, getNextRank, buyNextRank } from "../../features/ranks.js";

export function openRankUpMenu(player) {
    const current = getPlayerRank(player);
    const next = getNextRank(current);
    
    if (!next) { 
        player.sendMessage("§a§lGG! §rVocê já está no rank máximo."); 
        return; 
    }
    
    const perks = next.perks ? next.perks.map(p => \`§7- \${p}\`).join("\\n") : "";
    
    new ActionFormData()
        .title("§6SISTEMA DE RANKUP")
        .body(\`§fRank Atual: §b\${current.name}\\n\\n§fPróximo Rank: §e\${next.name}\\n§fPreço: §a\${config.economy.currencySymbol}\${next.price}\\n\\n§fBenefícios:\\n\${perks}\`)
        .button("§aCONFIRMAR EVOLUÇÃO")
        .button("§cCANCELAR")
        .show(player).then(res => { 
            if (res.selection === 0) player.sendMessage(buyNextRank(player).msg); 
        });
}
`;

export const MINE_MENU_CODE = `import { ActionFormData } from "@minecraft/server-ui";
import { config } from "../../core/config.js";
import { getPlayerRank } from "../../features/ranks.js";

export function openMinesMenu(player) {
    const form = new ActionFormData().title("§bMINAS DISPONÍVEIS");
    const currentRank = getPlayerRank(player);
    const currentRankIndex = config.ranks.findIndex(r => r.id === currentRank.id);
    const mines = config.ranks.filter(r => r.mine);
    
    config.ranks.forEach((rank, index) => {
        if (!rank.mine) return;
        const status = index > currentRankIndex ? "§c🔒 Bloqueado" : "§a🔓 Disponível";
        form.button(\`\${rank.name}\\n\${status}\`);
    });
    
    form.show(player).then(res => {
        if (res.canceled) return;
        if (res.selection < mines.length) {
            const targetRank = mines[res.selection];
            const targetIndex = config.ranks.findIndex(r => r.id === targetRank.id);
            
            if (targetIndex > currentRankIndex && !player.hasTag("admin")) { 
                player.sendMessage("§cRank insuficiente."); 
                return; 
            }
            
            try {
                // Parse simples do /fill para achar o centro
                const cmd = targetRank.mine.fillCommands.split('\\n')[0];
                const parts = cmd.replace("/", "").trim().split(/\\s+/);
                
                if (parts.length >= 7 && parts[0].toLowerCase() === "fill") {
                     const x1 = parseFloat(parts[1]);
                     const y1 = parseFloat(parts[2]);
                     const z1 = parseFloat(parts[3]);
                     const x2 = parseFloat(parts[4]);
                     const y2 = parseFloat(parts[5]);
                     const z2 = parseFloat(parts[6]);
                     
                     if (!isNaN(x1) && !isNaN(y1)) {
                         const centerX = (x1 + x2) / 2;
                         const centerZ = (z1 + z2) / 2;
                         const maxY = Math.max(y1, y2);
                         
                         // 1. Limpa efeitos anteriores
                         player.runCommandAsync("effect @s clear");
                         
                         // 2. Teleporta
                         player.teleport({ x: centerX, y: maxY + 1.5, z: centerZ }); 
                         
                         // 3. Aplica Haste Infinito (20000000 ticks)
                         player.addEffect("haste", 20000000, { 
                             amplifier: targetRank.mine.hasteAmplifier, 
                             showParticles: false 
                         });

                         player.sendMessage(\`§aTeleportado para Mina \${targetRank.name}!\`);
                     } else {
                         player.sendMessage("§cErro: Coordenadas da mina inválidas.");
                     }
                } else {
                     player.sendMessage("§cConfiguração de mina inválida.");
                }
            } catch(e) { player.sendMessage("§cErro ao calcular teleporte."); }
        }
    });
}
`;

export const SHOP_MENU_CODE = `import { ActionFormData } from "@minecraft/server-ui";
import { getShopCategories, getItemsByCategory, buyShopItem } from "../../features/shop.js";

export function openShopCategories(player) {
    const cats = getShopCategories();
    const form = new ActionFormData().title("§eSHOP");
    
    cats.forEach(c => form.button(\`§l\${c}\`));
    
    form.show(player).then(res => { 
        if (!res.canceled) openShopItems(player, cats[res.selection]); 
    });
}

export function openShopItems(player, category) {
    const items = getItemsByCategory(category);
    const form = new ActionFormData().title(\`§eSHOP - \${category}\`);
    
    if (items.length === 0) { 
        player.sendMessage("§cVazio."); 
        return; 
    }
    
    items.forEach(i => form.button(\`\${i.name}\\n§r§2\$\${i.price}\`));
    
    form.show(player).then(res => { 
        if (!res.canceled) player.sendMessage(buyShopItem(player, items[res.selection].id).msg); 
    });
}
`;

export const BANK_MENU_CODE = `import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { config } from "../../core/config.js";
import { getBalance, transferMoney } from "../../core/economy.js";
import { world } from "@minecraft/server";

export function openBankMenu(player) {
    new ActionFormData()
        .title("§2§lBANCO")
        .body(\`§fSeu Saldo: §a\${config.economy.currencySymbol}\${getBalance(player)}\`)
        .button("§aTransferir Dinheiro")
        .button("§cFechar")
        .show(player).then(res => { 
            if (res.selection === 0) openTransferMenu(player); 
        });
}

function openTransferMenu(player) {
    const players = world.getPlayers().filter(p => p.name !== player.name);
    
    if (players.length === 0) { 
        player.sendMessage("§cNinguém online para transferir."); 
        return; 
    }
    
    const playerNames = players.map(p => p.name);
    
    new ModalFormData()
        .title("§2TRANSFERÊNCIA")
        .dropdown("§fPara quem:", playerNames)
        .textField("§fValor:", "1000")
        .show(player).then(res => {
            if (res.canceled) return;
            const target = playerNames[res.formValues[0]];
            const amount = parseInt(res.formValues[1]);
            
            if (target && !isNaN(amount)) {
                player.sendMessage(transferMoney(player, target, amount).msg);
            }
        });
}
`;

export const PLOT_MENU_CODE = `import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { config } from "../../core/config.js";
import { claimPlot, teleportToPlot, getPlotMembers, addPlotMember } from "../../features/plots.js";

export function openPlotsMenu(player) {
    new ActionFormData()
        .title("§dSISTEMA DE PLOTS")
        .body("Gerencie seu terreno.")
        .button("§aIr para meu Plot")
        .button(\`§eComprar Plot (\$\${config.plots.cost})\`)
        .button("§bGerenciar Membros")
        .button("§cVoltar")
        .show(player).then(res => {
            if (res.selection === 0) {
                 // Limpa efeitos ao ir para o plot
                 player.runCommandAsync("effect @s clear");
                 teleportToPlot(player);
            }
            if (res.selection === 1) claimPlot(player).then(r => player.sendMessage(r.msg));
            if (res.selection === 2) openPlotMembersMenu(player);
        });
}

function openPlotMembersMenu(player) {
    const tags = player.getTags();
    const plotTag = tags.find(t => t.startsWith("plot_id:"));
    
    if (!plotTag) { 
        player.sendMessage("§cVocê não possui um plot."); 
        return; 
    }
    
    const plotId = plotTag.split(":")[1];
    const members = getPlotMembers(plotId);
    
    new ModalFormData()
        .title("§dMEMBROS DO PLOT")
        .textField(\`Membros atuais: \${members.length > 0 ? members.join(", ") : "Nenhum"}\\n\\nAdicionar novo membro:\`, "Nome do Jogador")
        .show(player).then(res => {
            if (res.canceled) return;
            const newMember = res.formValues[0];
            if (newMember) player.sendMessage(addPlotMember(player, plotId, newMember).msg);
        });
}
`;