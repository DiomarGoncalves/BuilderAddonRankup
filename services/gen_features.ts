import { AddonConfig, GeneratedFile } from "../types";
import { RANK_FEATURE_CODE } from "./templates/features/ranks";
import { MINES_FEATURE_CODE, AUTO_RESET_CODE } from "./templates/features/mines";
import { MACHINES_FEATURE_CODE } from "./templates/features/machines";
import { SELL_FEATURE_CODE, SHOP_FEATURE_CODE } from "./templates/features/economy";
import { PLOTS_FEATURE_CODE } from "./templates/features/plots";
import { NPCS_FEATURE_CODE } from "./templates/features/npcs";

export const generateFeatures = (config: AddonConfig): GeneratedFile[] => {
  const files: GeneratedFile[] = [];

  // RANKS
  files.push({
    path: "scripts/features/ranks.js",
    content: RANK_FEATURE_CODE
  });

  // MINES
  files.push({
    path: "scripts/features/mines.js",
    content: MINES_FEATURE_CODE
  });

  // AUTO RESET
  files.push({
    path: "scripts/features/autoReset.js",
    content: AUTO_RESET_CODE
  });

  // MACHINES
  files.push({
    path: "scripts/features/machines.js",
    content: MACHINES_FEATURE_CODE
  });

  // SELL
  files.push({
    path: "scripts/features/sell.js",
    content: SELL_FEATURE_CODE
  });

  // SHOP
  files.push({
    path: "scripts/features/shop.js",
    content: SHOP_FEATURE_CODE
  });

  // PLOTS
  files.push({
    path: "scripts/features/plots.js",
    content: PLOTS_FEATURE_CODE
  });

  // NPCS
  files.push({
    path: "scripts/features/npcs.js",
    content: NPCS_FEATURE_CODE
  });

  return files;
};