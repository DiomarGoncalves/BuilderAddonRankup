import React from 'react';
import { MachineConfig } from '../types';
import { Bot, Plus, Trash2, Box, ArrowDown } from 'lucide-react';

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
      dropsPerMinute: 20
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
          <Bot className="w-5 h-5" /> Máquinas Geradoras
        </h2>
        <button
          onClick={handleAddMachine}
          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Nova Máquina
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {machines.map((machine, index) => (
          <div key={machine.id} className="bg-gray-800 border border-gray-700 p-4 rounded-lg relative group flex flex-col md:flex-row gap-4 items-center">
             <button
              onClick={() => handleRemoveMachine(index)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="flex-1 w-full space-y-2">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="text-xs text-gray-500">ID Interno</label>
                        <input 
                            type="text" 
                            value={machine.id} 
                            onChange={(e) => handleChange(index, 'id', e.target.value)} 
                            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm font-mono text-yellow-400" 
                        />
                    </div>
                    <div className="flex-1">
                         <label className="text-xs text-gray-500">Nome da Máquina</label>
                        <input 
                            type="text" 
                            value={machine.name} 
                            onChange={(e) => handleChange(index, 'name', e.target.value)} 
                            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-white" 
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-gray-900/50 p-2 rounded border border-gray-700/50">
                    <div className="flex-1 text-center">
                        <Box className="w-4 h-4 mx-auto text-gray-400 mb-1"/>
                        <input 
                            type="text" 
                            value={machine.blockId} 
                            onChange={(e) => handleChange(index, 'blockId', e.target.value)} 
                            className="w-full bg-transparent border-b border-gray-600 text-center text-xs font-mono focus:border-minecraft-gold outline-none" 
                            placeholder="minecraft:gold_block"
                        />
                        <span className="text-[10px] text-gray-500">Bloco Colocado</span>
                    </div>

                    <ArrowDown className="w-4 h-4 text-gray-600" />

                    <div className="flex-1 text-center">
                         <div className="flex justify-center items-center gap-1 mb-1">
                             <span className="text-xs font-bold text-green-400">{machine.dropsPerMinute}</span>
                             <span className="text-[10px] text-gray-500">x/min</span>
                         </div>
                         <input 
                            type="range" 
                            min="1" max="120"
                            value={machine.dropsPerMinute} 
                            onChange={(e) => handleChange(index, 'dropsPerMinute', Number(e.target.value))} 
                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" 
                        />
                    </div>

                    <ArrowDown className="w-4 h-4 text-gray-600" />

                    <div className="flex-1 text-center">
                        <Box className="w-4 h-4 mx-auto text-yellow-500 mb-1"/>
                        <input 
                            type="text" 
                            value={machine.dropsItemId} 
                            onChange={(e) => handleChange(index, 'dropsItemId', e.target.value)} 
                            className="w-full bg-transparent border-b border-gray-600 text-center text-xs font-mono focus:border-minecraft-gold outline-none" 
                            placeholder="minecraft:gold_nugget"
                        />
                        <span className="text-[10px] text-gray-500">Item Dropado</span>
                    </div>
                </div>
            </div>

          </div>
        ))}
         {machines.length === 0 && <p className="text-gray-500 text-sm italic text-center">Nenhuma máquina configurada.</p>}
      </div>
    </div>
  );
};

export default MachineEditor;