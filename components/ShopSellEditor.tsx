import React from 'react';
import { ShopItem, SellItem, EnchantmentConfig } from '../types';
import { ShoppingCart, Coins, Plus, Trash2, Zap } from 'lucide-react';

interface ShopSellEditorProps {
  shopItems: ShopItem[];
  sellItems: SellItem[];
  onShopChange: (items: ShopItem[]) => void;
  onSellChange: (items: SellItem[]) => void;
}

const COMMON_ENCHANTS = [
  "efficiency", "unbreaking", "fortune", "mending", "sharpness", "fire_aspect", "looting", "silk_touch", "protection"
];

const ShopSellEditor: React.FC<ShopSellEditorProps> = ({ shopItems, sellItems, onShopChange, onSellChange }) => {
  
  // --- Shop Handlers ---
  const handleAddShopItem = () => {
    onShopChange([...shopItems, { id: Date.now().toString(), name: "Novo Item", itemType: "minecraft:apple", price: 100, amount: 1, category: "Outros", enchantments: [] }]);
  };

  const handleShopItemChange = (index: number, field: keyof ShopItem, value: any) => {
    const newItems = [...shopItems];
    newItems[index] = { ...newItems[index], [field]: value };
    onShopChange(newItems);
  };

  const handleRemoveShopItem = (index: number) => {
    const newItems = [...shopItems];
    newItems.splice(index, 1);
    onShopChange(newItems);
  };

  // --- Enchantment Handlers ---
  const handleAddEnchant = (itemIndex: number) => {
    const newItems = [...shopItems];
    const currentEnchants = newItems[itemIndex].enchantments || [];
    newItems[itemIndex] = {
      ...newItems[itemIndex],
      enchantments: [...currentEnchants, { type: "efficiency", level: 1 }]
    };
    onShopChange(newItems);
  };

  const handleEnchantChange = (itemIndex: number, enchIndex: number, field: keyof EnchantmentConfig, value: any) => {
    const newItems = [...shopItems];
    const newEnchants = [...(newItems[itemIndex].enchantments || [])];
    newEnchants[enchIndex] = { ...newEnchants[enchIndex], [field]: value };
    newItems[itemIndex].enchantments = newEnchants;
    onShopChange(newItems);
  };

  const handleRemoveEnchant = (itemIndex: number, enchIndex: number) => {
    const newItems = [...shopItems];
    const newEnchants = [...(newItems[itemIndex].enchantments || [])];
    newEnchants.splice(enchIndex, 1);
    newItems[itemIndex].enchantments = newEnchants;
    onShopChange(newItems);
  };

  // --- Sell Handlers ---
  const handleAddSellItem = () => {
    onSellChange([...sellItems, { itemType: "minecraft:cobblestone", pricePerUnit: 1 }]);
  };

  const handleSellItemChange = (index: number, field: keyof SellItem, value: any) => {
    const newItems = [...sellItems];
    newItems[index] = { ...newItems[index], [field]: value };
    onSellChange(newItems);
  };

  const handleRemoveSellItem = (index: number) => {
    const newItems = [...sellItems];
    newItems.splice(index, 1);
    onSellChange(newItems);
  };

  return (
    <div className="space-y-8">
      
      {/* SHOP SECTION */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-minecraft-gold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Loja (Comprar Itens)
          </h2>
          <button onClick={handleAddShopItem} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Item
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {shopItems.map((item, index) => (
            <div key={item.id} className="bg-gray-800 border border-gray-700 p-4 rounded relative group">
              <button onClick={() => handleRemoveShopItem(index)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
              
              <div className="flex flex-wrap md:flex-nowrap gap-3 mb-3">
                <div className="flex-1 min-w-[150px]">
                  <label className="text-xs text-gray-500 block mb-1">Nome Exibido</label>
                  <input type="text" value={item.name} onChange={(e) => handleShopItemChange(index, 'name', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm" />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="text-xs text-gray-500 block mb-1">ID Minecraft</label>
                  <input type="text" value={item.itemType} onChange={(e) => handleShopItemChange(index, 'itemType', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm font-mono" />
                </div>
                 <div className="w-32">
                  <label className="text-xs text-gray-500 block mb-1">Categoria</label>
                  <input 
                    type="text" 
                    value={item.category || ''} 
                    onChange={(e) => handleShopItemChange(index, 'category', e.target.value)} 
                    className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm" 
                    placeholder="Outros"
                  />
                </div>
                <div className="w-24">
                  <label className="text-xs text-gray-500 block mb-1">Preço</label>
                  <input type="number" value={item.price} onChange={(e) => handleShopItemChange(index, 'price', Number(e.target.value))} className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm" />
                </div>
                <div className="w-16">
                  <label className="text-xs text-gray-500 block mb-1">Qtd</label>
                  <input type="number" value={item.amount} onChange={(e) => handleShopItemChange(index, 'amount', Number(e.target.value))} className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm" />
                </div>
              </div>

              {/* Enchantments Sub-section */}
              <div className="bg-gray-900/50 p-3 rounded border border-gray-700/50">
                 <div className="flex justify-between items-center mb-2">
                    <label className="text-xs text-purple-400 font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Encantamentos
                    </label>
                    <button onClick={() => handleAddEnchant(index)} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add
                    </button>
                 </div>
                 
                 <div className="space-y-2">
                   {item.enchantments && item.enchantments.map((ench, eIndex) => (
                     <div key={eIndex} className="flex gap-2 items-center">
                        <div className="flex-1">
                           <input 
                             list={`ench-list-${index}`}
                             placeholder="Ex: efficiency"
                             value={ench.type}
                             onChange={(e) => handleEnchantChange(index, eIndex, 'type', e.target.value)}
                             className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-purple-200"
                           />
                           <datalist id={`ench-list-${index}`}>
                             {COMMON_ENCHANTS.map(e => <option key={e} value={e} />)}
                           </datalist>
                        </div>
                        <div className="w-16 flex items-center gap-1">
                           <span className="text-xs text-gray-500">Lvl</span>
                           <input 
                             type="number"
                             value={ench.level}
                             onChange={(e) => handleEnchantChange(index, eIndex, 'level', Number(e.target.value))}
                             className="w-full bg-gray-800 border border-gray-600 rounded px-1 py-1 text-xs text-center"
                           />
                        </div>
                        <button onClick={() => handleRemoveEnchant(index, eIndex)} className="text-gray-600 hover:text-red-400">
                          <Trash2 className="w-3 h-3" />
                        </button>
                     </div>
                   ))}
                   {(!item.enchantments || item.enchantments.length === 0) && (
                     <p className="text-[10px] text-gray-600 italic">Sem encantamentos.</p>
                   )}
                 </div>
              </div>

            </div>
          ))}
          {shopItems.length === 0 && <p className="text-gray-500 text-sm italic">Nenhum item à venda.</p>}
        </div>
      </div>

      {/* SELL SECTION */}
      <div className="space-y-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-minecraft-gold flex items-center gap-2">
            <Coins className="w-5 h-5" /> Venda (Minérios/Drops)
          </h2>
          <button onClick={handleAddSellItem} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Venda
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sellItems.map((item, index) => (
            <div key={index} className="bg-gray-800 border border-gray-700 p-3 rounded flex gap-3 items-end relative group">
              <button onClick={() => handleRemoveSellItem(index)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>
              
              <div className="flex-1">
                <label className="text-xs text-gray-500">ID do Item (Drop)</label>
                <input type="text" value={item.itemType} onChange={(e) => handleSellItemChange(index, 'itemType', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm font-mono" />
              </div>
              <div className="w-28">
                <label className="text-xs text-gray-500">Preço p/ Unidade</label>
                <input type="number" value={item.pricePerUnit} onChange={(e) => handleSellItemChange(index, 'pricePerUnit', Number(e.target.value))} className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm" />
              </div>
            </div>
          ))}
          {sellItems.length === 0 && <p className="text-gray-500 text-sm italic">Nenhum item configurado para venda.</p>}
        </div>
      </div>

    </div>
  );
};

export default ShopSellEditor;