import { AddonConfig, GeneratedFile } from "../types";
import { generateManifest } from "./gen_manifest";
import { generateCore } from "./gen_core";
import { generateFeatures } from "./gen_features";
import { generateUI } from "./gen_ui";
import { generateRuntime } from "./gen_runtime";

export const generateAddonCode = async (config: AddonConfig): Promise<GeneratedFile[]> => {
  const files: GeneratedFile[] = [];

  // 1. Manifest
  files.push(generateManifest(config));

  // 2. Main Entry Point
  files.push({
    path: "scripts/main.js",
    content: `import { startLoops } from "./runtime/loops.js";
import { registerEvents } from "./runtime/events.js";
import { initMachines } from "./features/machines.js";
import { startAutoMineResets } from "./features/autoReset.js";
import { config } from "./core/config.js";

// Initialize system
console.warn("[RankUP] Sistema Iniciado.");
startLoops();
registerEvents();
initMachines();
startAutoMineResets(config);
`
  });

  // 3. Modules
  files.push(...generateCore(config));
  files.push(...generateFeatures(config));
  files.push(...generateUI(config));
  files.push(...generateRuntime(config));

  // Simulating delay for UX
  await new Promise(r => setTimeout(r, 500));

  return files;
};