import { AddonConfig } from './types';

export const TECHNICAL_PROMPT_TEMPLATE = `
1. ARQUITETURA DE PASTAS OBRIGATÓRIA:
   - manifest.json
   - scripts/main.js (Ponto de entrada)
   - scripts/core/config.js (Configurações JSON injetadas)
   - scripts/core/economy.js (Sistema de economia com Scoreboard)
   - scripts/features/ranks.js (Lógica de RankUP)
   - scripts/features/mines.js (Reset de minas e Haste)
   - scripts/features/machines.js (Máquinas geradoras)
   - scripts/features/shop.js (Loja e categorias)
   - scripts/features/sell.js (Venda de itens)
   - scripts/features/plots.js (Sistema de terrenos)
   - scripts/ui/menu.js (Menus UI com @minecraft/server-ui)
   - scripts/ui/player.js (Interações do jogador)
   - scripts/runtime/loops.js (Loops principais: HUD, resets)
   - scripts/runtime/events.js (Eventos: quebrar bloco, interagir)

2. REGRAS DE CÓDIGO:
   - Use ES6 Modules (import/export).
   - Use APENAS a API @minecraft/server versão 1.11.0+ e @minecraft/server-ui 1.2.0+.
   - NÃO use APIs experimentais que não sejam estáveis (ex: Gametest não é necessário aqui, use world.afterEvents).
   - O código deve ser robusto: trate erros (try/catch) onde necessário.
   - O manifesto deve ter dependências corretas.
   - A economia deve usar ScoreboardObjectives (id: "money").
   - Máquinas devem usar blocks. location e guardar estado em memória ou scoreboard/dynamic properties se possível (para simplificar, use array em memória ou scoreboard dummy).
   - O sistema de Plots deve ser simples: baseado em coordenadas ou IDs simulados.

3. CONTEÚDO DOS ARQUIVOS:
   - Gere o código completo para cada arquivo listado acima.
   - Certifique-se de que os imports correspondam aos caminhos dos arquivos.
`;

export const INITIAL_CONFIG: AddonConfig = {
  serverName: "RankUP Pro",
  economy: {
    currencyName: "Money",
    currencySymbol: "$",
    startingBalance: 0
  },
  ranks: [
    {
      id: "rank_coal",
      name: "Carvão",
      price: 0,
      mine: {
        fillCommands: "/fill 276 -5 255 281 1 261 minecraft:coal_ore",
        resetTime: 300,
        hasteAmplifier: 1
      },
      perks: ["Acesso à Mina Carvão", "Kit Iniciante"]
    },
    {
      id: "rank_iron",
      name: "Ferro",
      price: 25000,
      mine: {
        fillCommands: "/fill 290 -5 255 295 1 261 minecraft:iron_ore",
        resetTime: 300,
        hasteAmplifier: 2
      },
      perks: ["Acesso à Mina Ferro", "Multiplicador 1.1x"]
    }
  ],
  shop: [
    { 
      id: "pick_op", 
      name: "Picareta God", 
      itemType: "minecraft:diamond_pickaxe", 
      category: "Ferramentas",
      price: 50000, 
      amount: 1,
      enchantments: [
        { type: "efficiency", level: 5 },
        { type: "unbreaking", level: 3 },
        { type: "fortune", level: 3 },
        { type: "mending", level: 1 }
      ]
    },
    { 
      id: "machine_coin_item", 
      name: "Máquina de Moedas", 
      itemType: "minecraft:gold_block", 
      category: "Máquinas", 
      price: 100000, 
      amount: 1, 
      enchantments: [] 
    }
  ],
  sellItems: [
    { itemType: "minecraft:coal", pricePerUnit: 10 },
    { itemType: "minecraft:iron_ingot", pricePerUnit: 50 },
    { itemType: "minecraft:raw_iron", pricePerUnit: 40 },
    { itemType: "minecraft:diamond", pricePerUnit: 500 }
  ],
  machines: [
    {
      id: "machine_coin",
      name: "Máquina de Moedas",
      blockId: "minecraft:gold_block",
      dropsItemId: "minecraft:gold_nugget",
      dropsPerMinute: 20
    },
    {
      id: "machine_iron",
      name: "Gerador de Ferro",
      blockId: "minecraft:iron_block",
      dropsItemId: "minecraft:iron_ingot",
      dropsPerMinute: 10
    }
  ],
  plots: {
    enabled: true,
    plotSize: 32,
    cost: 10000,
    worldStart: { x: 1000, y: 64, z: 1000 }
  }
};