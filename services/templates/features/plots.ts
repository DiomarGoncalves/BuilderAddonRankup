export const PLOTS_FEATURE_CODE = `import { config } from "../core/config.js";
import { getBalance, removeMoney } from "../core/economy.js";
import { world, system } from "@minecraft/server";

const PLOT_SIZE = config.plots.plotSize;
const PATH_SIZE = 5;
const TOTAL_SIZE = PLOT_SIZE + PATH_SIZE;

export function getPlotIdAt(location) {
    if (!config.plots.enabled) return -1;
    const relX = location.x - config.plots.worldStart.x;
    const relZ = location.z - config.plots.worldStart.z;
    if (relX < 0 || relZ < 0) return -1;
    const col = Math.floor(relX / TOTAL_SIZE);
    const row = Math.floor(relZ / TOTAL_SIZE);
    const withinCol = (relX % TOTAL_SIZE) <= PLOT_SIZE;
    const withinRow = (relZ % TOTAL_SIZE) <= PLOT_SIZE;
    if (withinCol && withinRow) return (row * 100) + col;
    return -1;
}

function getPlotCoords(plotId) {
    const col = plotId % 100;
    const row = Math.floor(plotId / 100);
    const x = config.plots.worldStart.x + (col * TOTAL_SIZE);
    const z = config.plots.worldStart.z + (row * TOTAL_SIZE);
    return { x, z, y: config.plots.worldStart.y };
}

function getPlotCenter(plotId) {
    const coords = getPlotCoords(plotId);
    return { x: coords.x + (PLOT_SIZE / 2), y: coords.y + 1, z: coords.z + (PLOT_SIZE / 2) };
}

// Calculate the road position right next to the plot for kicking intruders
export function getSafeKickLocation(plotId) {
    const coords = getPlotCoords(plotId);
    // Kick to the path: MinX - 2 (Middle of the path, assuming PATH_SIZE >= 3)
    // We use a fixed Y (ground level) from config to ensure they don't fall into void or get stuck
    return { 
        x: coords.x - 2, 
        y: config.plots.worldStart.y + 1, 
        z: coords.z + (PLOT_SIZE / 2) 
    };
}

export function getPlotOwner(plotId) { return world.getDynamicProperty(\`p_\${plotId}_owner\`); }
export function getPlotMembers(plotId) { const s = world.getDynamicProperty(\`p_\${plotId}_members\`); return s ? s.split(",") : []; }

export function addPlotMember(player, plotId, newMemberName) {
    const owner = getPlotOwner(plotId);
    if (owner !== player.name) return { success: false, msg: "Não é seu plot." };
    const members = getPlotMembers(plotId);
    if (members.includes(newMemberName)) return { success: false, msg: "Já é membro." };
    members.push(newMemberName);
    world.setDynamicProperty(\`p_\${plotId}_members\`, members.join(","));
    return { success: true, msg: \`§a\${newMemberName} adicionado!\` };
}

async function generatePlotBorder(dimension, x, y, z, size) {
    const borderBlock = "minecraft:stone_slab"; 
    const minX = x, minZ = z, maxX = x + size - 1, maxZ = z + size - 1;
    const outMinX = x - 1, outMinZ = z - 1, outMaxX = x + size, outMaxZ = z + size;
    const commands = [
        \`fill \${minX} \${y} \${minZ} \${maxX} \${y} \${minZ} \${borderBlock}\`,
        \`fill \${minX} \${y} \${maxZ} \${maxX} \${y} \${maxZ} \${borderBlock}\`,
        \`fill \${minX} \${y} \${minZ} \${minX} \${y} \${maxZ} \${borderBlock}\`,
        \`fill \${maxX} \${y} \${minZ} \${maxX} \${y} \${maxZ} \${borderBlock}\`,
        \`fill \${outMinX} \${y} \${outMinZ} \${outMaxX} \${y} \${outMinZ} \${borderBlock}\`,
        \`fill \${outMinX} \${y} \${outMaxZ} \${outMaxX} \${y} \${outMaxZ} \${borderBlock}\`,
        \`fill \${outMinX} \${y} \${outMinZ} \${outMinX} \${y} \${outMaxZ} \${borderBlock}\`,
        \`fill \${outMaxX} \${y} \${outMinZ} \${outMaxX} \${y} \${outMaxZ} \${borderBlock}\`
    ];
    for (const cmd of commands) { try { await dimension.runCommandAsync(cmd); } catch(e) {} }
}

export function teleportToPlot(player) {
    const tags = player.getTags();
    const plotTag = tags.find(t => t.startsWith("plot_id:"));
    if (plotTag) {
        const id = parseInt(plotTag.split(":")[1]);
        player.teleport(getPlotCenter(id));
        player.sendMessage("§aTeleportado para seu plot!");
    } else { player.sendMessage("§cVocê não tem um plot."); }
}

export async function claimPlot(player) {
    if (!config.plots.enabled) return { success: false, msg: "Plots desativados." };
    if (player.hasTag("has_plot")) return { success: false, msg: "Você já tem um plot!" };
    if (getBalance(player) < config.plots.cost) return { success: false, msg: "Sem dinheiro." };

    let obj = world.scoreboard.getObjective("sys_plots");
    if (!obj) obj = world.scoreboard.addObjective("sys_plots", "System");
    let score = 0;
    try { score = obj.getScore("next_id") || 0; } catch (e) {}
    const myId = score;

    removeMoney(player, config.plots.cost);
    obj.setScore("next_id", myId + 1);
    world.setDynamicProperty(\`p_\${myId}_owner\`, player.name);
    player.addTag("has_plot");
    player.addTag(\`plot_id:\${myId}\`);
    player.teleport(getPlotCenter(myId));
    system.runTimeout(() => {
        const coords = getPlotCoords(myId);
        generatePlotBorder(player.dimension, coords.x, coords.y, coords.z, PLOT_SIZE);
        player.sendMessage("§eTerreno delimitado!");
    }, 20);
    return { success: true, msg: \`§aPlot #\${myId} comprado!\` };
}

export function checkPlotPermission(player, block) {
    if (!config.plots.enabled) return true;
    const plotId = getPlotIdAt(block.location);
    if (plotId === -1) return true; 
    const owner = getPlotOwner(plotId);
    if (!owner) return true; 
    if (owner === player.name) return true;
    const members = getPlotMembers(plotId);
    if (members.includes(player.name)) return true;
    return false;
}
`;