import React from 'react';
import { BoostersConfig, VipRank, TemporaryBooster } from '../types';
import { Zap, Crown, Clock, Plus, Trash2 } from 'lucide-react';

interface BoostersEditorProps {
  config: BoostersConfig;
  onChange: (config: BoostersConfig) => void;
}

const BoostersEditor: React.FC<BoostersEditorProps> = ({ config, onChange }) => {
  
  const handleVipAdd = () => {
    onChange({
      ...config,
      vips: [...config.vips, { tag: "new_vip", name: "Novo VIP", multiplier: 1.1 }]
    });
  };

  const handleVipChange = (index: number, field: keyof VipRank, value: any) => {
    const newVips = [...config.vips];
    newVips[index] = { ...newVips[index], [field]: value };
    onChange({ ...config, vips: newVips });
  };

  const handleVipRemove = (index: number) => {
    const newVips = [...config.vips];
    newVips.splice(index, 1);
    onChange({ ...config, vips: newVips });
  };

  const handleBoosterAdd = () => {
    onChange({
      ...config,
      items: [...config.items, { 
        id: `boost_${Date.now()}`, 
        name: "Novo Booster", 
        type: "sell", 
        multiplier: 2.0, 
        durationMinutes: 10 
      }]
    });
  };

  const handleBoosterChange = (index: number, field: keyof TemporaryBooster, value: any) => {
    const newItems = [...config.items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...config, items: newItems });
  };

  const handleBoosterRemove = (index: number) => {
    const newItems = [...config.items];
    newItems.splice(index, 1);
    onChange({ ...config, items: newItems });
  };

  return (
    <div className="space-y-8">
       <div className="flex justify-between items-center">
         <h2 className="text-xl font-bold text-minecraft-gold flex items-center gap-2">
           <Zap className="w-5 h-5" /> Boosters & Multiplicadores
         </h2>
         <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Sistema Ativo?</label>
            <input 
              type="checkbox" 
              checked={config.enabled} 
              onChange={(e) => onChange({ ...config, enabled: e.target.checked })} 
              className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-minecraft-accent"
            />
         </div>
       </div>

       {config.enabled && (
         <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
           
           {/* GLOBAL */}
           <div className="bg-minecraft-panel border border-gray-700 p-4 rounded-lg">
              <h3 className="text-sm font-bold text-gray-300 uppercase mb-2 flex items-center gap-2">
                 🌎 Multiplicador Global
              </h3>
              <div className="flex items-center gap-4">
                 <div className="flex-1">
                    <label className="text-xs text-gray-500">Multiplicador do Servidor</label>
                    <input 
                      type="number" step="0.1" 
                      value={config.globalMultiplier} 
                      onChange={(e) => onChange({ ...config, globalMultiplier: parseFloat(e.target.value) })}
                      className="w-full bg-gray-800 border border-gray-600 rounded p-2 mt-1 text-white"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Afeta todos os jogadores (ex: Evento Fim de Semana).</p>
                 </div>
              </div>
           </div>

           {/* VIPS */}
           <div className="bg-minecraft-panel border border-gray-700 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-yellow-400 uppercase flex items-center gap-2">
                  <Crown className="w-4 h-4" /> Multiplicadores VIP (Por Tag)
                </h3>
                <button onClick={handleVipAdd} className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add VIP
                </button>
              </div>
              
              <div className="space-y-2">
                 {config.vips.map((vip, i) => (
                    <div key={i} className="flex gap-2 items-center bg-gray-800 p-2 rounded relative group">
                       <div className="flex-1">
                          <label className="text-[10px] text-gray-500">Nome VIP</label>
                          <input type="text" value={vip.name} onChange={(e) => handleVipChange(i, 'name', e.target.value)} className="w-full bg-transparent border-b border-gray-600 text-sm focus:outline-none focus:border-yellow-500" />
                       </div>
                       <div className="w-24">
                          <label className="text-[10px] text-gray-500">Tag (/tag)</label>
                          <input type="text" value={vip.tag} onChange={(e) => handleVipChange(i, 'tag', e.target.value)} className="w-full bg-transparent border-b border-gray-600 text-sm font-mono focus:outline-none focus:border-yellow-500" />
                       </div>
                       <div className="w-16">
                          <label className="text-[10px] text-gray-500">Mult.</label>
                          <input type="number" step="0.1" value={vip.multiplier} onChange={(e) => handleVipChange(i, 'multiplier', parseFloat(e.target.value))} className="w-full bg-transparent border-b border-gray-600 text-sm text-green-400 focus:outline-none focus:border-green-500" />
                       </div>
                       <button onClick={() => handleVipRemove(i)} className="text-gray-600 hover:text-red-500 ml-2"><Trash2 className="w-4 h-4" /></button>
                    </div>
                 ))}
                 {config.vips.length === 0 && <p className="text-xs text-gray-500 italic">Nenhum VIP configurado.</p>}
              </div>
           </div>

           {/* TEMPORARY BOOSTERS */}
           <div className="bg-minecraft-panel border border-gray-700 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-blue-400 uppercase flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Boosters Temporários (Consumíveis)
                </h3>
                <button onClick={handleBoosterAdd} className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Booster
                </button>
              </div>

              <div className="space-y-2">
                 {config.items.map((item, i) => (
                    <div key={item.id} className="flex flex-col md:flex-row gap-3 bg-gray-800 p-3 rounded relative group border border-gray-700">
                       <button onClick={() => handleBoosterRemove(i)} className="absolute top-2 right-2 text-gray-600 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                       
                       <div className="flex-1 min-w-[150px]">
                          <label className="text-[10px] text-gray-500">Nome do Booster</label>
                          <input type="text" value={item.name} onChange={(e) => handleBoosterChange(i, 'name', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm" />
                       </div>
                       
                       <div className="w-32">
                          <label className="text-[10px] text-gray-500">Tipo</label>
                          <select value={item.type} onChange={(e) => handleBoosterChange(i, 'type', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-gray-300">
                             <option value="sell">Venda (Coins)</option>
                             <option value="machine">Máquinas (Drops)</option>
                          </select>
                       </div>

                       <div className="w-20">
                          <label className="text-[10px] text-gray-500">Mult.</label>
                          <input type="number" step="0.1" value={item.multiplier} onChange={(e) => handleBoosterChange(i, 'multiplier', parseFloat(e.target.value))} className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-green-400" />
                       </div>

                       <div className="w-24">
                          <label className="text-[10px] text-gray-500">Duração (min)</label>
                          <input type="number" value={item.durationMinutes} onChange={(e) => handleBoosterChange(i, 'durationMinutes', parseFloat(e.target.value))} className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-blue-300" />
                       </div>

                       <div className="w-32">
                          <label className="text-[10px] text-gray-500">ID (Sistema)</label>
                          <input type="text" disabled value={item.id} className="w-full bg-transparent text-[10px] text-gray-600 font-mono" />
                       </div>
                    </div>
                 ))}
                 {config.items.length === 0 && <p className="text-xs text-gray-500 italic">Nenhum booster configurado.</p>}
              </div>
           </div>

         </div>
       )}
    </div>
  );
};

export default BoostersEditor;