import React from 'react';
import { EconomyConfig } from '../types';
import { Settings, Coins } from 'lucide-react';

interface SettingsEditorProps {
  serverName: string;
  economy: EconomyConfig;
  onServerNameChange: (name: string) => void;
  onEconomyChange: (economy: EconomyConfig) => void;
}

const SettingsEditor: React.FC<SettingsEditorProps> = ({ serverName, economy, onServerNameChange, onEconomyChange }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-minecraft-gold flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Configurações Gerais
      </h2>

      <div className="bg-minecraft-panel border border-gray-700 p-6 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-4">
             <h3 className="text-lg font-semibold text-gray-300">Servidor</h3>
             <div>
                <label className="block text-sm text-gray-400 mb-1">Nome do Servidor</label>
                <input
                  type="text"
                  value={serverName}
                  onChange={(e) => onServerNameChange(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white focus:border-minecraft-gold outline-none"
                />
             </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-lg font-semibold text-gray-300 flex items-center gap-2">
                <Coins className="w-4 h-4" /> Economia
             </h3>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nome da Moeda</label>
                  <input
                    type="text"
                    value={economy.currencyName}
                    onChange={(e) => onEconomyChange({ ...economy, currencyName: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white focus:border-minecraft-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Símbolo</label>
                  <input
                    type="text"
                    value={economy.currencySymbol}
                    onChange={(e) => onEconomyChange({ ...economy, currencySymbol: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white focus:border-minecraft-gold outline-none"
                  />
                </div>
             </div>
             <div>
                <label className="block text-sm text-gray-400 mb-1">Saldo Inicial</label>
                <input
                  type="number"
                  value={economy.startingBalance}
                  onChange={(e) => onEconomyChange({ ...economy, startingBalance: Number(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white focus:border-minecraft-gold outline-none"
                />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsEditor;