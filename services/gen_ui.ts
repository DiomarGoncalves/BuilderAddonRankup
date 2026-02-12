import { AddonConfig, GeneratedFile } from "../types";
import { MAIN_MENU_CODE } from "./templates/ui/main";
import { RANK_MENU_CODE, MINE_MENU_CODE, SHOP_MENU_CODE, BANK_MENU_CODE, PLOT_MENU_CODE, BOOSTERS_MENU_CODE, MISSIONS_MENU_CODE } from "./templates/ui/gameplay";
import { ADMIN_MENU_CODE } from "./templates/ui/admin";

export const generateUI = (config: AddonConfig): GeneratedFile[] => {
  const files: GeneratedFile[] = [];

  // 1. MAIN MENU (Hub)
  files.push({
    path: "scripts/ui/menu.js",
    content: MAIN_MENU_CODE
  });

  // 2. RANK MENU
  files.push({
    path: "scripts/ui/menus/rank.js",
    content: RANK_MENU_CODE
  });

  // 3. MINE MENU
  files.push({
    path: "scripts/ui/menus/mine.js",
    content: MINE_MENU_CODE
  });

  // 4. SHOP MENU
  files.push({
    path: "scripts/ui/menus/shop.js",
    content: SHOP_MENU_CODE
  });

  // 5. PLOT MENU
  files.push({
    path: "scripts/ui/menus/plot.js",
    content: PLOT_MENU_CODE
  });

  // 6. BANK MENU
  files.push({
    path: "scripts/ui/menus/bank.js",
    content: BANK_MENU_CODE
  });

  // 7. ADMIN MENU
  files.push({
    path: "scripts/ui/menus/admin.js",
    content: ADMIN_MENU_CODE
  });

  // 8. BOOSTERS MENU (Only if enabled)
  if (config.boosters && config.boosters.enabled) {
      files.push({
        path: "scripts/ui/menus/boosters.js",
        content: BOOSTERS_MENU_CODE
      });
  }

  // 9. MISSIONS MENU
  if (config.missions && config.missions.enabled) {
      files.push({
        path: "scripts/ui/menus/missions.js",
        content: MISSIONS_MENU_CODE
      });
  }

  return files;
};