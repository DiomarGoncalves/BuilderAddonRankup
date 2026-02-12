export interface Coordinates {
  x: number;
  y: number;
  z: number;
}

export interface MineConfig {
  blockType?: string; 
  pos1?: Coordinates;
  pos2?: Coordinates;
  
  fillCommands: string;
  resetTime: number; 
  hasteAmplifier: number;
  regionEffects: boolean; 
  effectType: string; 
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

export interface BankConfig {
  enabled: boolean;
}

export interface VipRank {
  tag: string; 
  name: string; 
  multiplier: number; 
}

export interface TemporaryBooster {
  id: string;
  name: string;
  type: 'sell' | 'machine';
  multiplier: number;
  durationMinutes: number;
}

export interface BoostersConfig {
  enabled: boolean;
  globalMultiplier: number; 
  vips: VipRank[];
  items: TemporaryBooster[];
}

export interface Mission {
  id: string;
  name: string;
  type: 'mine' | 'sell' | 'rankup';
  target: number; // Amount to reach
  period: 'daily' | 'weekly';
  rewardType: 'money' | 'item' | 'booster';
  rewardValue: number; // Amount of money or item count
  rewardId?: string; // Item ID or Booster ID
}

export interface MissionsConfig {
  enabled: boolean;
  list: Mission[];
}

export interface ProtectionConfig {
  enabled: boolean;
  mineProtection: boolean; // Prevent breaking walls/floor
  blockPlaceInMine: boolean; // Allow placing blocks in mine? (Usually false)
  antiExploit: {
    maxSellPerMinute: number; // 0 = unlimited
  };
  adminLogs: boolean; // Log actions to chat for admins
}

export interface EnchantmentConfig {
  type: string; 
  level: number;
}

export interface ShopItem {
  id: string;
  name: string;
  itemType: string; 
  price: number;
  amount: number;
  category?: string;
  enchantments: EnchantmentConfig[];
}

export interface SellItem {
  itemType: string; 
  pricePerUnit: number;
}

export interface MachineConfig {
  id: string;
  name: string;
  blockId: string; 
  dropsItemId: string; 
  dropsPerMinute: number;
  dropMode: 'below'; 
  storageMode: 'drop' | 'chest'; 
  maxPerChunk: number; 
}

export interface PlotConfig {
  enabled: boolean;
  plotSize: number; 
  worldStart: Coordinates; 
  cost: number;
}

export interface AddonConfig {
  serverName: string;
  economy: EconomyConfig;
  bank: BankConfig;
  boosters: BoostersConfig;
  missions: MissionsConfig;
  protection: ProtectionConfig;
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