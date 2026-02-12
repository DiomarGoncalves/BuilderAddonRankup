import { AddonConfig, GeneratedFile } from "../types";
import { EVENTS_RUNTIME_CODE } from "./templates/runtime/events";

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
  
  // 1. Inicializa a Sidebar Global uma única vez
  initGlobalSidebar();

  // 2. Loop Principal (HUD e Lógica de Jogador) - A cada 20 ticks (1 segundo)
  system.runInterval(() => {
    for (const player of world.getPlayers()) {
        if (!player.isValid()) continue;

        // A. ACTION BAR (HUD PESSOAL)
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

        // B. Efeitos de Região (Mina)
        try {
          const mine = mineAt(config, player.location);
          // Verifica se a mina existe e se a flag regionEffects não é 'false' (padrão true)
          if (mine && mine.regionEffects !== false) {
            const effect = mine.effectType || "haste";
            const amp = mine.hasteAmplifier || 0;
            
            // Aplica efeito por 40 ticks (2 segundos)
            // O loop roda a cada 20 ticks. Dando 40 ticks, garantimos que não pisque.
            // Quando o jogador sair, o efeito acaba em no máximo 2 segundos.
            player.addEffect(effect, 40, {
              amplifier: amp,
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
    content: EVENTS_RUNTIME_CODE
  });

  return files;
};