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
                         
                         player.runCommandAsync("effect @s clear");
                         player.teleport({ x: centerX, y: maxY + 1.5, z: centerZ }); 
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
import { getBankBalance, depositMoney, withdrawMoney } from "../../features/bank.js";
import { world } from "@minecraft/server";

export function openBankMenu(player) {
    if (!config.bank || !config.bank.enabled) {
        player.sendMessage("§cO sistema de banco está desativado.");
        return;
    }

    const wallet = getBalance(player);
    const bank = getBankBalance(player);
    const sym = config.economy.currencySymbol;

    new ActionFormData()
        .title("§2§lBANCO CENTRAL")
        .body(\`§fCarteira: §a\${sym}\${wallet}\\n§fBanco: §e\${sym}\${bank}\\n\\n§7Gerencie suas finanças com segurança.\`)
        .button("§aDepositar", "textures/ui/arrow_down")
        .button("§cSacar", "textures/ui/arrow_up")
        .button("§bTransferir", "textures/ui/send_icon")
        .button("§cFechar", "textures/ui/cancel")
        .show(player).then(res => { 
            if (res.selection === 0) openDepositMenu(player);
            if (res.selection === 1) openWithdrawMenu(player);
            if (res.selection === 2) openTransferMenu(player);
        });
}

function openDepositMenu(player) {
    new ModalFormData()
        .title("§aDEPOSITAR")
        .textField("Quantidade para depositar:", "Ex: 1000")
        .toggle("Depositar Tudo?", false)
        .show(player).then(res => {
            if (res.canceled) return;
            const amountStr = res.formValues[0];
            const all = res.formValues[1];
            
            let amount = parseInt(amountStr);
            if (all) amount = getBalance(player);
            
            if (!isNaN(amount) && amount > 0) {
                player.sendMessage(depositMoney(player, amount).msg);
            } else {
                player.sendMessage("§cValor inválido.");
            }
        });
}

function openWithdrawMenu(player) {
    new ModalFormData()
        .title("§cSACAR")
        .textField("Quantidade para sacar:", "Ex: 1000")
        .toggle("Sacar Tudo?", false)
        .show(player).then(res => {
            if (res.canceled) return;
            const amountStr = res.formValues[0];
            const all = res.formValues[1];
            
            let amount = parseInt(amountStr);
            if (all) amount = getBankBalance(player);
            
            if (!isNaN(amount) && amount > 0) {
                player.sendMessage(withdrawMoney(player, amount).msg);
            } else {
                player.sendMessage("§cValor inválido.");
            }
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
        .textField("§fValor (da carteira):", "1000")
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

export const BOOSTERS_MENU_CODE = `import { ActionFormData } from "@minecraft/server-ui";
import { config } from "../../core/config.js";
import { getSellMultiplier, getMachineMultiplier, getBoosterEndTime } from "../../features/boosters.js";

export function openBoostersMenu(player) {
    if (!config.boosters || !config.boosters.enabled) return;

    const sellMult = getSellMultiplier(player);
    const machMult = getMachineMultiplier(player);
    
    const sellEnd = getBoosterEndTime(player, 'sell');
    const machEnd = getBoosterEndTime(player, 'machine');
    const now = Date.now();
    
    const sellTimeLeft = sellEnd > now ? Math.ceil((sellEnd - now) / 60000) + "m" : "---";
    const machTimeLeft = machEnd > now ? Math.ceil((machEnd - now) / 60000) + "m" : "---";

    new ActionFormData()
        .title("§eBOOSTERS ATIVOS")
        .body(
            \`§7Veja seus multiplicadores atuais:\\n\\n\` +
            \`§a§lVENDA (Global + VIP + Booster)\\n\` +
            \`§r§fMultiplicador Atual: §e\${sellMult.toFixed(1)}x\\n\` +
            \`§fTempo Booster: §b\${sellTimeLeft}\\n\\n\` +
            \`§6§lMÁQUINAS (Global + VIP + Booster)\\n\` +
            \`§r§fMultiplicador Atual: §e\${machMult.toFixed(1)}x\\n\` +
            \`§fTempo Booster: §b\${machTimeLeft}\`
        )
        .button("§cFechar")
        .show(player);
}
`;

export const MISSIONS_MENU_CODE = `import { ActionFormData } from "@minecraft/server-ui";
import { config } from "../../core/config.js";
import { checkAndResetMissions, getMissionStatus, claimMissionReward } from "../../features/missions.js";

export function openMissionsMenu(player) {
    if (!config.missions || !config.missions.enabled) return;
    checkAndResetMissions(player);

    const form = new ActionFormData()
        .title("§dMISSÕES & QUESTS")
        .body("§7Conclua tarefas diárias e semanais para ganhar recompensas!");

    const missions = config.missions.list;
    const statuses = missions.map(m => ({ m, status: getMissionStatus(player, m.id) }));

    statuses.forEach(({ m, status }) => {
        let icon = "textures/ui/lock";
        let prefix = "§c";
        
        if (status.completed) {
            if (status.claimed) {
                icon = "textures/ui/check";
                prefix = "§a[OK] ";
            } else {
                icon = "textures/ui/star_holo"; // Placeholder
                prefix = "§e[RESGATAR] ";
            }
        } else {
            prefix = "§7";
        }

        const percent = Math.floor((status.progress / status.target) * 100);
        form.button(\`\${prefix}\${m.name}\\n§r§8Progresso: \${status.progress}/\${status.target} (\${percent}%)\`, icon);
    });

    form.show(player).then(res => {
        if (res.canceled) return;
        const selected = statuses[res.selection];
        
        if (selected.status.completed && !selected.status.claimed) {
            player.sendMessage(claimMissionReward(player, selected.m.id).msg);
        } else if (selected.status.claimed) {
            player.sendMessage("§cJá resgatada.");
        } else {
            player.sendMessage(\`§eFalta pouco! \${selected.status.progress}/\${selected.status.target}\`);
        }
    });
}
`;