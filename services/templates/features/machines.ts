export const MACHINES_FEATURE_CODE = `import { world, system, ItemStack } from "@minecraft/server";
import { config } from "../core/config.js";

const activeMachines = new Map();
const OBJ_ID = "ru_machines";

function getObjective() {
    let obj = world.scoreboard.getObjective(OBJ_ID);
    if (!obj) obj = world.scoreboard.addObjective(OBJ_ID, "Machines Data");
    return obj;
}

export function initMachines() {
    const obj = getObjective();
    for (const participant of obj.getParticipants()) {
        try {
            const data = participant.displayName;
            const [x, y, z, dim, type] = data.split(":");
            if (!x || !y || !z || !dim || !type) continue;
            const key = \`\${x}:\${y}:\${z}:\${dim}\`;
            activeMachines.set(key, {
                x: parseInt(x), y: parseInt(y), z: parseInt(z),
                dim: dim, type: type, lastDrop: Date.now()
            });
        } catch (e) {}
    }
}

export function registerMachine(player, block, machineId) {
    const key = \`\${block.location.x}:\${block.location.y}:\${block.location.z}:\${block.dimension.id}\`;
    const dataString = \`\${block.location.x}:\${block.location.y}:\${block.location.z}:\${block.dimension.id}:\${machineId}\`;
    if (activeMachines.has(key)) return;
    activeMachines.set(key, {
        x: block.location.x, y: block.location.y, z: block.location.z,
        dim: block.dimension.id, type: machineId, lastDrop: Date.now()
    });
    getObjective().setScore(dataString, 1);
    player.sendMessage(\`§aMáquina \${machineId} colocada!\`);
}

export function removeMachine(block) {
    const key = \`\${block.location.x}:\${block.location.y}:\${block.location.z}:\${block.dimension.id}\`;
    if (activeMachines.has(key)) {
        activeMachines.delete(key);
        return true;
    }
    return false;
}

export function machinesTick() {
    const now = Date.now();
    for (const [key, machine] of activeMachines) {
        const mConfig = config.machines.find(m => m.id === machine.type);
        if (!mConfig) continue;
        const msPerDrop = (60000 / mConfig.dropsPerMinute);
        if (now - machine.lastDrop >= msPerDrop) {
            try {
                const dim = world.getDimension(machine.dim);
                if (!dim) continue;
                try {
                    const block = dim.getBlock({ x: machine.x, y: machine.y, z: machine.z });
                    if (!block || block.typeId !== mConfig.blockId) {
                        activeMachines.delete(key);
                        continue;
                    }
                } catch (e) { continue; } 
                const dropLoc = { x: machine.x + 0.5, y: machine.y + 1.0, z: machine.z + 0.5 };
                const itemStack = new ItemStack(mConfig.dropsItemId, 1);
                dim.spawnItem(itemStack, dropLoc);
                machine.lastDrop = now;
            } catch (e) {}
        }
    }
}
`;