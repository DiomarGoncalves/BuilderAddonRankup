export const MACHINES_FEATURE_CODE = `import { world, system, ItemStack } from "@minecraft/server";
import { config } from "../core/config.js";
import { getMachineMultiplier } from "./boosters.js";

const activeMachines = new Map();
const OBJ_ID = "ru_machines";

// Scoreboard format: "x:y:z:dim:type:ownerName"
// We added ownerName to the end for 2.0+

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
            // Split by :
            // Old format: x:y:z:dim:type (len 5)
            // New format: x:y:z:dim:type:owner (len 6)
            const parts = data.split(":");
            if (parts.length < 5) continue;
            
            const [x, y, z, dim, type, owner] = parts;
            
            const key = \`\${x}:\${y}:\${z}:\${dim}\`;
            activeMachines.set(key, {
                x: parseInt(x), y: parseInt(y), z: parseInt(z),
                dim: dim, type: type, 
                owner: owner || null, // Backwards compat
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
        
        // Remove from scoreboard (try both formats if strict matching needed, but we usually iterate.
        // Scoreboard API requires exact participant match to remove. We reconstruct it.)
        const ownerSuffix = machine.owner ? \`:\${machine.owner}\` : "";
        const dataString = \`\${machine.x}:\${machine.y}:\${machine.z}:\${machine.dim}:\${machine.type}\${ownerSuffix}\`;
        
        try { getObjective().removeParticipant(dataString); } catch(e) {}
        
        // Also try removing old format just in case it was a legacy machine
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
    
    // Cache owners to avoid looking up player object every ms
    const playerCache = new Map(); // name -> PlayerObject

    for (const [key, machine] of activeMachines) {
        const mConfig = config.machines.find(m => m.id === machine.type);
        if (!mConfig) continue;

        // Calculate rate with Multiplier
        let multiplier = 1.0;
        
        // Only apply multipliers if we know the owner and they are online
        if (machine.owner) {
            let ownerPlayer = playerCache.get(machine.owner);
            if (!ownerPlayer) {
                const players = world.getPlayers({ name: machine.owner });
                if (players.length > 0) {
                    ownerPlayer = players[0];
                    playerCache.set(machine.owner, ownerPlayer);
                }
            }
            if (ownerPlayer) {
                multiplier = getMachineMultiplier(ownerPlayer);
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
            } catch (e) {}
        }
    }
}
`;