import { AddonConfig, GeneratedFile } from "../types";

export const generateCore = (config: AddonConfig): GeneratedFile[] => {
  const files: GeneratedFile[] = [];

  // 1. CONFIG.JS
  files.push({
    path: "scripts/core/config.js",
    content: `// Auto-generated configuration
export const config = ${JSON.stringify(config, null, 2)};
`
  });

  // 2. ECONOMY.JS
  files.push({
    path: "scripts/core/economy.js",
    content: `import { world } from "@minecraft/server";
import { config } from "./config.js";

const OBJ_ID = "money";

function getObjective() {
    let obj = world.scoreboard.getObjective(OBJ_ID);
    if (!obj) obj = world.scoreboard.addObjective(OBJ_ID, config.economy.currencyName);
    return obj;
}

export function getBalance(player) {
    try {
        const score = getObjective().getScore(player);
        return score ?? config.economy.startingBalance;
    } catch {
        return config.economy.startingBalance;
    }
}

export function addMoney(player, amount) {
    getObjective().addScore(player, amount);
}

export function removeMoney(player, amount) {
    const current = getBalance(player);
    getObjective().setScore(player, current - amount);
}

export function transferMoney(sender, receiverName, amount) {
    if (amount <= 0) return { success: false, msg: "§cValor inválido." };
    const senderBal = getBalance(sender);
    if (senderBal < amount) return { success: false, msg: "§cSaldo insuficiente." };

    const players = world.getPlayers({ name: receiverName });
    if (players.length === 0) return { success: false, msg: "§cJogador offline ou não encontrado." };
    const receiver = players[0];

    removeMoney(sender, amount);
    addMoney(receiver, amount);

    receiver.sendMessage(\`§aRecebeu \${config.economy.currencySymbol}\${amount} de \${sender.name}\`);
    return { success: true, msg: \`§aEnviado \${config.economy.currencySymbol}\${amount} para \${receiverName}\` };
}
`
  });

  // 3. DISPLAY.JS (Sidebar Implementation)
  files.push({
    path: "scripts/core/display.js",
    content: `import { world } from "@minecraft/server";
import { config } from "./config.js";

const SB_ID = "board_main";

// Inicializa a Sidebar Global
// No Bedrock, a Sidebar é compartilhada por todos. Stats individuais (Money/Rank) devem ir na Actionbar.
export function initGlobalSidebar() {
    try {
        const sbManager = world.scoreboard;
        let sb = sbManager.getObjective(SB_ID);
        
        // Se não existir, cria. Se existir, não removemos para evitar piscar.
        if (!sb) {
            sb = sbManager.addObjective(SB_ID, \`§6§l\${config.serverName}\`);
        }

        // Define no slot lateral
        sbManager.setObjectiveAtDisplaySlot("sidebar", { objective: sb });

        // Conteúdo Estático Global
        // Como 'setScore' acumula linhas se o texto mudar, usamos textos fixos aqui.
        sb.setScore("§7----------------", 15);
        sb.setScore(" §fBem-vindo!", 14);
        sb.setScore("   ", 13);
        sb.setScore(" §fUse o Item:", 12);
        sb.setScore(" §a Bússola (Menu)", 11);
        sb.setScore("    ", 10);
        sb.setScore(" §fSeus Stats:", 9);
        sb.setScore(" §e Olhe a Actionbar", 8); // Indica onde olhar o dinheiro
        sb.setScore("§7---------------- ", 1);
        
    } catch (e) {
        console.warn("Erro ao iniciar Sidebar:", e);
    }
}
`
  });

  return files;
};