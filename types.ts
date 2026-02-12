export interface Coordinates {
  x: number;
  y: number;
  z: number;
}

export interface MineConfig {
  // blockType, pos1, pos2 are legacy for the UI helper, but the core logic now uses fillCommands
  blockType?: string; 
  pos1?: Coordinates;
  pos2?: Coordinates;
  
  fillCommands: string; // Primary source of truth for the mine geometry
  resetTime: number; // in seconds
  hasteAmplifier: number;
}

export interface Rank {
  id: string;
  name: string;
  price: number;
  mine: MineConfig;
  perks: string[];
}

export interface EconomyConfig {
  currencyName: string;
  currencySymbol: string;
  startingBalance: number;
}

export interface EnchantmentConfig {
  type: string; // ex: efficiency
  level: number;
}

export interface ShopItem {
  id: string;
  name: string;
  itemType: string; // ex: minecraft:diamond_pickaxe
  price: number;
  amount: number;
  category?: string;
  enchantments: EnchantmentConfig[];
}

export interface SellItem {
  itemType: string; // ex: minecraft:coal
  pricePerUnit: number;
}

export interface MachineConfig {
  id: string;
  name: string;
  blockId: string; // The block placed in the world
  dropsItemId: string; // The item generated
  dropsPerMinute: number;
}

export interface PlotConfig {
  enabled: boolean;
  plotSize: number; // ex: 32x32
  worldStart: Coordinates; // Where plots begin generating
  cost: number;
}

export interface AddonConfig {
  serverName: string;
  economy: EconomyConfig;
  ranks: Rank[];
  shop: ShopItem[];
  sellItems: SellItem[];
  machines: MachineConfig[];
  plots: PlotConfig;
}

export interface GeneratedFile {
  path: string;
  content: string;
}

export enum AppStatus {
  IDLE,
  GENERATING,
  SUCCESS,
  ERROR
}