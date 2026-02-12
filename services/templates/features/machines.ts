export const MACHINES_FEATURE_CODE = `import { world, system, ItemStack } from "@minecraft/server";
import { config } from "../core/config.js";
import { getMachineMultiplier } from "./boosters.js";

const activeMachines = new Map();
const OBJ_ID = "ru_machines";

// Scoreboard format: "x:y:z:dim:type:ownerName"

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
            const parts = data.split(":");
            if (parts.length < 5) continue;
            
            const [x, y, z, dim, type, owner] = parts;
            
            const key = \`\${x}:\${y}:\${z}:\${dim}\`;
            activeMachines.set(key, {
                x: parseInt(x), y: parseInt(y), z: parseInt(z),
                dim: dim, type: type, 
                owner: owner || null, 
                lastDrop: Date.now()
            });
        } catch (e) {}
    }
    console.warn(\`[RankUP] Carregadas \${activeMachines.size} máquinas.\`);
}

function getChunkId(x, z) {
    const cx = Math.floor(x / 16);
    const cz = Math.floor(z / 16);
    return \`\${cx}:\${cz}\`;
}

function countMachinesInChunk(dimId, chunkId) {
    let count = 0;
    for (const machine of activeMachines.values()) {
        if (machine.dim !== dimId) continue;
        if (getChunkId(machine.x, machine.z) === chunkId) {
            count++;
        }
    }
    return count;
}

export function registerMachine(player, block, machineId) {
    const mConfig = config.machines.find(m => m.id === machineId);
    if (!mConfig) return;

    const chunkId = getChunkId(block.location.x, block.location.z);
    const currentCount = countMachinesInChunk(block.dimension.id, chunkId);
    const limit = mConfig.maxPerChunk || 16; 
    
    if (currentCount >= limit) {
        player.sendMessage(\`§c§lLIMITE ATINGIDO! §r§7Este chunk já tem \${currentCount}/\${limit} máquinas.\`);
        block.dimension.runCommandAsync(\`setblock \${block.location.x} \${block.location.y} \${block.location.z} air destroy\`);
        return;
    }

    const key = \`\${block.location.x}:\${block.location.y}:\${block.location.z}:\${block.dimension.id}\`;
    if (activeMachines.has(key)) return;

    const ownerName = player.name;

    activeMachines.set(key, {
        x: block.location.x, y: block.location.y, z: block.location.z,
        dim: block.dimension.id, type: machineId,
        owner: ownerName,
        lastDrop: Date.now()
    });

    // Save with owner
    const dataString = \`\${block.location.x}:\${block.location.y}:\${block.location.z}:\${block.dimension.id}:\${machineId}:\${ownerName}\`;
    getObjective().setScore(dataString, 1);

    player.sendMessage(\`§aMáquina colocada! (§e\${currentCount + 1}/\${limit}§a no chunk)\`);
}

export function removeMachine(block) {
    const key = \`\${block.location.x}:\${block.location.y}:\${block.location.z}:\${block.dimension.id}\`;
    if (activeMachines.has(key)) {
        const machine = activeMachines.get(key);
        activeMachines.delete(key);
        
        const ownerSuffix = machine.owner ? \`:\${machine.owner}\` : "";
        const dataString = \`\${machine.x}:\${machine.y}:\${machine.z}:\${machine.dim}:\${machine.type}\${ownerSuffix}\`;
        
        try { getObjective().removeParticipant(dataString); } catch(e) {}
        
        if (!machine.owner) {
             const oldData = \`\${machine.x}:\${machine.y}:\${machine.z}:\${machine.dim}:\${machine.type}\`;
             try { getObjective().removeParticipant(oldData); } catch(e) {}
        }

        return true;
    }
    return false;
}

export function machinesTick() {
    const now = Date.now();
    const playerCache = new Map(); 

    for (const [key, machine] of activeMachines) {
        const mConfig = config.machines.find(m => m.id === machine.type);
        if (!mConfig) continue;

        let multiplier = 1.0;
        
        if (machine.owner) {
            // Check cache first
            let ownerPlayer = playerCache.get(machine.owner);
            
            // If not in cache, check world
            if (!ownerPlayer) {
                const players = world.getPlayers({ name: machine.owner });
                if (players.length > 0) {
                    ownerPlayer = players[0];
                    playerCache.set(machine.owner, ownerPlayer);
                }
            }
            
            // If online, get multiplier. If offline, stays 1.0.
            if (ownerPlayer) {
                try {
                    multiplier = getMachineMultiplier(ownerPlayer);
                } catch (e) { multiplier = 1.0; }
            }
        }

        const baseMs = (60000 / mConfig.dropsPerMinute);
        const adjustedMs = baseMs / multiplier; 
        
        if (now - machine.lastDrop >= adjustedMs) {
            try {
                const dim = world.getDimension(machine.dim);
                if (!dim) continue;
                
                let block;
                try { block = dim.getBlock({ x: machine.x, y: machine.y, z: machine.z }); } catch (e) { continue; }

                if (!block || block.typeId !== mConfig.blockId) {
                    // Block gone, remove machine data
                    activeMachines.delete(key);
                    const ownerSuffix = machine.owner ? \`:\${machine.owner}\` : "";
                    const dataString = \`\${machine.x}:\${machine.y}:\${machine.z}:\${machine.dim}:\${machine.type}\${ownerSuffix}\`;
                    try { getObjective().removeParticipant(dataString); } catch(e) {}
                    continue;
                }

                const itemStack = new ItemStack(mConfig.dropsItemId, 1);
                const targetLoc = { x: machine.x, y: machine.y - 1, z: machine.z };
                let success = false;

                if (mConfig.storageMode === 'chest') {
                    try {
                        const belowBlock = dim.getBlock(targetLoc);
                        if (belowBlock) {
                            const inv = belowBlock.getComponent("inventory");
                            if (inv && inv.container) {
                                inv.container.addItem(itemStack);
                                success = true;
                            }
                        }
                    } catch (e) {}
                }

                if (!success) {
                    const dropLoc = { x: targetLoc.x + 0.5, y: targetLoc.y + 0.5, z: targetLoc.z + 0.5 };
                    dim.spawnItem(itemStack, dropLoc);
                }

                machine.lastDrop = now;
            } catch (e) {
                // If chunk is unloaded, getting block/dim throws error. 
                // We ignore it so the machine keeps working when chunk reloads.
            }
        }
    }
}
`;