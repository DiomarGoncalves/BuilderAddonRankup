export const MINES_FEATURE_CODE = `import { world } from "@minecraft/server";
import { config } from "../core/config.js";

// Helper to safely parse coordinates from fill command strings
function parseFillCoords(cmd) {
    try {
        // Remove slash, trim whitespace, and split by one or more spaces
        const parts = cmd.replace("/", "").trim().split(/\\s+/);
        
        // Expected format: fill x1 y1 z1 x2 y2 z2 block ...
        // Index:           0    1  2  3  4  5  6
        
        if (parts.length < 7) return null;
        if (parts[0].toLowerCase() !== "fill") return null;

        const x1 = parseFloat(parts[1]);
        const y1 = parseFloat(parts[2]);
        const z1 = parseFloat(parts[3]);
        const x2 = parseFloat(parts[4]);
        const y2 = parseFloat(parts[5]);
        const z2 = parseFloat(parts[6]);

        if (isNaN(x1) || isNaN(y1) || isNaN(z1) || isNaN(x2) || isNaN(y2) || isNaN(z2)) return null;

        return { x1, y1, z1, x2, y2, z2 };
    } catch (e) {
        return null;
    }
}

export function mineAt(config, location) {
    for (const rank of config.ranks) {
        if (!rank.mine || !rank.mine.fillCommands) continue;
        
        // Handle multiline commands - assume the first line defines the area
        const firstCmd = rank.mine.fillCommands.split('\\n')[0];
        const coords = parseFillCoords(firstCmd);
        
        if (!coords) continue;

        // Add a small buffer (0.5) to ensure edge cases (standing exactly on the line) are covered
        const minX = Math.min(coords.x1, coords.x2) - 0.5; 
        const maxX = Math.max(coords.x1, coords.x2) + 1.5;
        const minY = Math.min(coords.y1, coords.y2) - 0.5;
        const maxY = Math.max(coords.y1, coords.y2) + 1.5;
        const minZ = Math.min(coords.z1, coords.z2) - 0.5;
        const maxZ = Math.max(coords.z1, coords.z2) + 1.5;

        if (location.x >= minX && location.x <= maxX &&
            location.y >= minY && location.y <= maxY &&
            location.z >= minZ && location.z <= maxZ) {
            return rank.mine;
        }
    }
    return null;
}

export async function resetMine(mineConfig, dimension) {
    if (!dimension) dimension = world.getDimension("overworld");
    try {
        if (mineConfig.fillCommands) {
            const commands = mineConfig.fillCommands.split('\\n');
            let executed = 0;
            for (let cmd of commands) {
                cmd = cmd.trim();
                if (!cmd) continue;
                if (cmd.startsWith("/")) cmd = cmd.substring(1);
                await dimension.runCommandAsync(cmd);
                executed++;
            }
            // Optional log
            // if (executed > 0) console.warn(\`Mina resetada\`);
        }
    } catch (e) { console.warn("Erro reset mina: " + e); }
}
`;

export const AUTO_RESET_CODE = `import { world, system } from "@minecraft/server";
import { resetMine } from "./mines.js";

function parseFillCoords(cmd) {
  try {
    const parts = cmd.replace("/", "").trim().split(/\\s+/);
    if (parts.length < 7) return null;
    if (parts[0].toLowerCase() !== "fill") return null;

    const x1 = parseFloat(parts[1]);
    const y1 = parseFloat(parts[2]);
    const z1 = parseFloat(parts[3]);
    const x2 = parseFloat(parts[4]);
    const y2 = parseFloat(parts[5]);
    const z2 = parseFloat(parts[6]);

    if ([x1,y1,z1,x2,y2,z2].some(n => Number.isNaN(n))) return null;
    return { x1, y1, z1, x2, y2, z2 };
  } catch {
    return null;
  }
}

function getMineBoundsFromFillCommands(fillCommands) {
  if (!fillCommands) return null;
  const firstCmd = fillCommands.split("\\n")[0]?.trim();
  if (!firstCmd) return null;

  const coords = parseFillCoords(firstCmd);
  if (!coords) return null;

  // Small buffer to ensure player is really "inside"
  const minX = Math.min(coords.x1, coords.x2) - 0.01;
  const maxX = Math.max(coords.x1, coords.x2) + 1.01;
  const minY = Math.min(coords.y1, coords.y2) - 0.01;
  const maxY = Math.max(coords.y1, coords.y2) + 1.01;
  const minZ = Math.min(coords.z1, coords.z2) - 0.01;
  const maxZ = Math.max(coords.z1, coords.z2) + 1.01;

  return { minX, maxX, minY, maxY, minZ, maxZ };
}

function isPlayerInsideBounds(player, b) {
  const { x, y, z } = player.location;
  return x >= b.minX && x <= b.maxX &&
         y >= b.minY && y <= b.maxY &&
         z >= b.minZ && z <= b.maxZ;
}

function anyPlayerInsideMine(dimension, bounds) {
  const players = dimension.getPlayers();
  for (const p of players) {
    if (isPlayerInsideBounds(p, bounds)) return true;
  }
  return false;
}

export function startAutoMineResets(config) {
  const state = new Map(); // key: mineKey -> { running, nextResetMs, pending }

  system.runInterval(async () => {
    const now = Date.now();

    for (const rank of config.ranks) {
      const mine = rank.mine;
      if (!mine || !mine.fillCommands) continue;

      const resetTime = Number(mine.resetTime);
      if (!resetTime || resetTime <= 0) continue;

      const bounds = getMineBoundsFromFillCommands(mine.fillCommands);
      if (!bounds) continue;

      const dimensionId = "overworld"; // Default to overworld
      const dimension = world.getDimension(dimensionId);

      const mineKey = \`\${rank.id}_mine\`;

      if (!state.has(mineKey)) {
        state.set(mineKey, {
          running: false,
          pending: false,
          nextResetMs: now + resetTime * 1000
        });
      }

      const s = state.get(mineKey);

      if (s.running) continue;

      // If time hasn't passed yet
      if (!s.pending && now < s.nextResetMs) continue;

      // Check for players inside
      const hasPlayer = anyPlayerInsideMine(dimension, bounds);
      if (hasPlayer) {
        // Player inside, mark as pending and try again next tick
        s.pending = true;
        continue;
      }

      // Safe to reset
      s.running = true;
      s.pending = false;

      try {
        await resetMine(mine, dimension);
        // Optional: Broadcast reset
        // world.sendMessage(\`§e[Mina] §fMina \${rank.name} resetada.\`);
      } catch (e) {
        console.warn(\`[AutoReset] Falha ao resetar mina \${rank.name}: \${e}\`);
      } finally {
        s.nextResetMs = Date.now() + resetTime * 1000;
        s.running = false;
      }
    }
  }, 20); // Check every second
}
`;