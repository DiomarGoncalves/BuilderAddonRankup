import React from 'react';
import { MachineConfig } from '../types';
import { Bot, Plus, Trash2, Box, ArrowDown, Package, Settings, AlertTriangle } from 'lucide-react';

interface MachineEditorProps {
  machines: MachineConfig[];
  onChange: (machines: MachineConfig[]) => void;
}

const MachineEditor: React.FC<MachineEditorProps> = ({ machines, onChange }) => {
  const handleAddMachine = () => {
    const newMachine: MachineConfig = {
      id: `machine_${Date.now()}`,
      name: `Nova Máquina`,
      blockId: "minecraft:gold_block",
      dropsItemId: "minecraft:gold_nugget",
      dropsPerMinute: 20,
      dropMode: "below",
      storageMode: "chest",
      maxPerChunk: 16
    };
    onChange([...machines, newMachine]);
  };

  const handleRemoveMachine = (index: number) => {
    const newItems = [...machines];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  const handleChange = (index: number, field: keyof MachineConfig, value: any) => {
    const newItems = [...machines];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-minecraft-gold flex items-center gap-2">
          <Bot className="w-5 h-5" /> Máquinas Geradoras (Industrial)
        </h2>
        <button
          onClick={handleAddMachine}
          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Nova Máquina
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {machines.map((machine, index) => (
          <div key={machine.id} className="bg-gray-800 border border-gray-700 p-4 rounded-lg relative group flex flex-col gap-4">
             <button
              onClick={() => handleRemoveMachine(index)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                     <label className="text-xs text-gray-500">Nome Exibido</label>
                     <input 
                         type="text" 
                         value={machine.name} 
                         onChange={(e) => handleChange(index, 'name', e.target.value)} 
                         className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:border-minecraft-gold outline-none" 
                     />
                 </div>
                 <div>
                     <label className="text-xs text-gray-500">ID Interno (Machine ID)</label>
                     <input 
                         type="text" 
                         value={machine.id} 
                         onChange={(e) => handleChange(index, 'id', e.target.value)} 
                         className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm font-mono text-yellow-400 focus:border-minecraft-gold outline-none" 
                     />
                 </div>
            </div>

            {/* Visual Logic Flow */}
            <div className="flex flex-col items-center bg-gray-900/50 p-4 rounded border border-gray-700/50 relative">
                 <div className="absolute top-2 left-2 text-[10px] text-gray-500 flex items-center gap-1">
                     <Settings className="w-3 h-3" /> Configuração Lógica
                 </div>

                 {/* Block */}
                 <div className="w-full md:w-1/2 mb-2">
                    <label className="text-[10px] text-gray-400 text-center block mb-1">Bloco Gerador (Colocado no Mundo)</label>
                    <div className="flex items-center gap-2 bg-gray-800 p-2 rounded border border-gray-600">
                        <Box className="w-4 h-4 text-gray-400"/>
                        <input 
                            type="text" 
                            value={machine.blockId} 
                            onChange={(e) => handleChange(index, 'blockId', e.target.value)} 
                            className="flex-1 bg-transparent text-sm font-mono focus:outline-none text-center" 
                            placeholder="minecraft:gold_block"
                        />
                    </div>
                 </div>

                 <div className="flex flex-col items-center justify-center my-1">
                     <div className="h-4 w-px bg-gray-600"></div>
                     <ArrowDown className="w-4 h-4 text-gray-500" />
                 </div>

                 {/* Rate */}
                 <div className="w-full md:w-1/2 flex items-center gap-4 bg-gray-800/50 p-2 rounded mb-2">
                     <div className="flex-1">
                         <label className="text-[10px] text-gray-500 block">Velocidade (Drops/Min)</label>
                         <input 
                            type="range" 
                            min="1" max="120"
                            value={machine.dropsPerMinute} 
                            onChange={(e) => handleChange(index, 'dropsPerMinute', Number(e.target.value))} 
                            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer mt-2" 
                        />
                     </div>
                     <span className="text-sm font-bold text-green-400 min-w-[3rem] text-center">{machine.dropsPerMinute}x</span>
                 </div>

                 <div className="flex flex-col items-center justify-center my-1">
                     <div className="h-4 w-px bg-gray-600"></div>
                     <ArrowDown className="w-4 h-4 text-gray-500" />
                 </div>

                 {/* Output & Mode */}
                 <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Item */}
                     <div className="bg-gray-800 p-2 rounded border border-gray-600">
                        <label className="text-[10px] text-gray-400 text-center block mb-1">Item Gerado</label>
                        <div className="flex items-center gap-2">
                            <Box className="w-4 h-4 text-yellow-500"/>
                            <input 
                                type="text" 
                                value={machine.dropsItemId} 
                                onChange={(e) => handleChange(index, 'dropsItemId', e.target.value)} 
                                className="flex-1 bg-transparent text-sm font-mono focus:outline-none text-center" 
                                placeholder="minecraft:gold_nugget"
                            />
                        </div>
                     </div>

                     {/* Storage Logic */}
                     <div className="bg-gray-800 p-2 rounded border border-gray-600 flex flex-col justify-between">
                         <label className="text-[10px] text-gray-400 text-center block mb-1">Modo de Saída (Output)</label>
                         <div className="flex justify-center gap-2">
                             <button
                               onClick={() => handleChange(index, 'storageMode', 'drop')}
                               className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${machine.storageMode === 'drop' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                             >
                               <ArrowDown className="w-3 h-3"/> Drop Chão
                             </button>
                             <button
                               onClick={() => handleChange(index, 'storageMode', 'chest')}
                               className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${machine.storageMode === 'chest' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                             >
                               <Package className="w-3 h-3"/> Baú Abaixo
                             </button>
                         </div>
                     </div>
                 </div>
            </div>

            {/* Anti Lag */}
            <div className="flex items-center gap-2 text-xs bg-gray-900/30 p-2 rounded">
                 <AlertTriangle className="w-4 h-4 text-orange-500" />
                 <span className="text-gray-400">Limite por Chunk:</span>
                 <input 
                     type="number"
                     value={machine.maxPerChunk || 16}
                     onChange={(e) => handleChange(index, 'maxPerChunk', Number(e.target.value))}
                     className="w-16 bg-gray-800 border border-gray-600 rounded px-1 text-center"
                 />
                 <span className="text-gray-500 ml-auto">Previne LAG em grandes farms.</span>
            </div>

          </div>
        ))}
         {machines.length === 0 && <p className="text-gray-500 text-sm italic text-center">Nenhuma máquina configurada.</p>}
      </div>
    </div>
  );
};

export default MachineEditor;