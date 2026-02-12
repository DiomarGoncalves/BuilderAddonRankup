import React from 'react';
import { MissionsConfig, Mission } from '../types';
import { Target, Calendar, Gift, Plus, Trash2, Clock } from 'lucide-react';

interface MissionsEditorProps {
  config: MissionsConfig;
  onChange: (config: MissionsConfig) => void;
}

const MissionsEditor: React.FC<MissionsEditorProps> = ({ config, onChange }) => {
  
  const handleAddMission = () => {
    const newMission: Mission = {
      id: `m_${Date.now()}`,
      name: "Nova Missão",
      type: "mine",
      target: 100,
      period: "daily",
      rewardType: "money",
      rewardValue: 1000
    };
    onChange({ ...config, list: [...config.list, newMission] });
  };

  const handleRemoveMission = (index: number) => {
    const newList = [...config.list];
    newList.splice(index, 1);
    onChange({ ...config, list: newList });
  };

  const handleChange = (index: number, field: keyof Mission, value: any) => {
    const newList = [...config.list];
    newList[index] = { ...newList[index], [field]: value };
    onChange({ ...config, list: newList });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-minecraft-gold flex items-center gap-2">
          <Target className="w-5 h-5" /> Missões & Quests
        </h2>
        <div className="flex items-center gap-2">
           <label className="text-sm text-gray-400">Ativar Sistema?</label>
           <input 
             type="checkbox" 
             checked={config.enabled} 
             onChange={(e) => onChange({ ...config, enabled: e.target.checked })} 
             className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-minecraft-accent"
           />
        </div>
      </div>

      <div className={`space-y-4 ${!config.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
         <div className="flex justify-end">
            <button onClick={handleAddMission} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
                <Plus className="w-4 h-4" /> Criar Missão
            </button>
         </div>

         <div className="grid grid-cols-1 gap-4">
            {config.list.map((mission, index) => (
               <div key={mission.id} className="bg-minecraft-panel border border-gray-700 p-4 rounded-lg relative group flex flex-col gap-4">
                   <button onClick={() => handleRemoveMission(index)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>
                   
                   {/* Header Row */}
                   <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                       <div className="flex-1 w-full">
                           <label className="text-[10px] text-gray-400">Nome da Missão</label>
                           <input type="text" value={mission.name} onChange={(e) => handleChange(index, 'name', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white font-bold" />
                       </div>
                       <div className="w-full md:w-32">
                           <label className="text-[10px] text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3"/> Período</label>
                           <select value={mission.period} onChange={(e) => handleChange(index, 'period', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm text-yellow-200">
                               <option value="daily">Diária</option>
                               <option value="weekly">Semanal</option>
                           </select>
                       </div>
                   </div>

                   <hr className="border-gray-700"/>

                   {/* Goal Row */}
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                           <label className="text-[10px] text-gray-400">Objetivo (Tipo)</label>
                           <select value={mission.type} onChange={(e) => handleChange(index, 'type', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-sm">
                               <option value="mine">Minerar Blocos</option>
                               <option value="sell">Vender Itens (Qtd)</option>
                               <option value="rankup">Subir de Rank</option>
                           </select>
                       </div>
                       <div>
                           <label className="text-[10px] text-gray-400">Meta (Quantidade)</label>
                           <input type="number" value={mission.target} onChange={(e) => handleChange(index, 'target', Number(e.target.value))} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-sm font-mono text-blue-300" />
                       </div>
                   </div>

                   {/* Reward Row */}
                   <div className="bg-gray-900/40 p-3 rounded border border-gray-700/50">
                       <div className="flex items-center gap-2 mb-2 text-xs text-green-400 font-bold uppercase">
                           <Gift className="w-3 h-3" /> Recompensa
                       </div>
                       <div className="grid grid-cols-3 gap-3">
                           <div>
                               <label className="text-[10px] text-gray-500">Tipo</label>
                               <select value={mission.rewardType} onChange={(e) => handleChange(index, 'rewardType', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-xs">
                                   <option value="money">Money</option>
                                   <option value="item">Item</option>
                                   <option value="booster">Booster</option>
                               </select>
                           </div>
                           
                           {mission.rewardType === 'money' ? (
                               <div className="col-span-2">
                                   <label className="text-[10px] text-gray-500">Valor ($)</label>
                                   <input type="number" value={mission.rewardValue} onChange={(e) => handleChange(index, 'rewardValue', Number(e.target.value))} className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-xs" />
                               </div>
                           ) : (
                               <>
                                   <div>
                                       <label className="text-[10px] text-gray-500">Qtd / Duração</label>
                                       <input type="number" value={mission.rewardValue} onChange={(e) => handleChange(index, 'rewardValue', Number(e.target.value))} className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-xs" />
                                   </div>
                                   <div>
                                       <label className="text-[10px] text-gray-500">{mission.rewardType === 'item' ? 'ID do Item' : 'ID do Booster'}</label>
                                       <input type="text" value={mission.rewardId || ''} onChange={(e) => handleChange(index, 'rewardId', e.target.value)} placeholder={mission.rewardType === 'item' ? 'minecraft:diamond' : 'boost_id'} className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-xs" />
                                   </div>
                               </>
                           )}
                       </div>
                   </div>

               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default MissionsEditor;