import React from 'react';
import { Rank } from '../types';
import { Trash2, Plus, Zap, Box } from 'lucide-react';

interface RankEditorProps {
  ranks: Rank[];
  onChange: (ranks: Rank[]) => void;
}

const RankEditor: React.FC<RankEditorProps> = ({ ranks, onChange }) => {
  const handleAddRank = () => {
    const newRank: Rank = {
      id: `rank_${ranks.length + 1}`,
      name: `Novo Rank ${ranks.length + 1}`,
      price: (ranks.length + 1) * 10000,
      mine: {
        fillCommands: "/fill 0 0 0 5 5 5 minecraft:stone",
        resetTime: 300,
        hasteAmplifier: 1
      },
      perks: []
    };
    onChange([...ranks, newRank]);
  };

  const handleRemoveRank = (index: number) => {
    const newRanks = [...ranks];
    newRanks.splice(index, 1);
    onChange(newRanks);
  };

  const handleRankChange = (index: number, field: keyof Rank, value: any) => {
    const newRanks = [...ranks];
    newRanks[index] = { ...newRanks[index], [field]: value };
    onChange(newRanks);
  };

  const handleMineChange = (index: number, field: keyof Rank['mine'], value: any) => {
    const newRanks = [...ranks];
    newRanks[index] = { 
      ...newRanks[index], 
      mine: { ...newRanks[index].mine, [field]: value } 
    };
    onChange(newRanks);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-minecraft-gold flex items-center gap-2">
          <Box className="w-5 h-5" />
          Configuração de Ranks e Minas
        </h2>
        <button
          onClick={handleAddRank}
          className="bg-minecraft-accent hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Adicionar Rank
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {ranks.map((rank, index) => (
          <div key={index} className="bg-minecraft-panel border border-gray-700 p-4 rounded-lg shadow-lg relative group">
            <button
              onClick={() => handleRemoveRank(index)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rank Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2">Informações do Rank</h3>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nome do Rank</label>
                  <input
                    type="text"
                    value={rank.name}
                    onChange={(e) => handleRankChange(index, 'name', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white focus:border-minecraft-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Preço (Coins)</label>
                  <input
                    type="number"
                    value={rank.price}
                    onChange={(e) => handleRankChange(index, 'price', Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white focus:border-minecraft-gold outline-none"
                  />
                </div>
              </div>

              {/* Mine Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2">Configuração da Mina</h3>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Comando de Preenchimento (/fill)</label>
                  <textarea
                    value={rank.mine.fillCommands}
                    onChange={(e) => handleMineChange(index, 'fillCommands', e.target.value)}
                    placeholder="/fill x1 y1 z1 x2 y2 z2 minecraft:stone"
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-xs font-mono text-green-400 focus:border-minecraft-gold outline-none resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Copie e cole o comando /fill gerado no jogo aqui.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs text-gray-500 mb-1">Tempo de Reset (s)</label>
                     <input 
                       type="number" 
                       value={rank.mine.resetTime} 
                       onChange={(e) => handleMineChange(index, 'resetTime', Number(e.target.value))} 
                       className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-sm" 
                     />
                  </div>
                  <div>
                     <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-500" /> Nível do Haste
                     </label>
                     <input 
                       type="number" 
                       value={rank.mine.hasteAmplifier} 
                       onChange={(e) => handleMineChange(index, 'hasteAmplifier', Number(e.target.value))} 
                       placeholder="1"
                       className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-sm" 
                     />
                  </div>
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankEditor;