import React from 'react';
import { EconomyConfig, BankConfig } from '../types';
import { Settings, Coins, Landmark } from 'lucide-react';

interface SettingsEditorProps {
  serverName: string;
  economy: EconomyConfig;
  bank?: BankConfig;
  onServerNameChange: (name: string) => void;
  onEconomyChange: (economy: EconomyConfig) => void;
  onBankChange?: (bank: BankConfig) => void;
}

const SettingsEditor: React.FC<SettingsEditorProps> = ({ serverName, economy, bank, onServerNameChange, onEconomyChange, onBankChange }) => {
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
          
          {bank && onBankChange && (
            <div className="space-y-4">
               <h3 className="text-lg font-semibold text-gray-300 flex items-center gap-2">
                  <Landmark className="w-4 h-4" /> Banco
               </h3>
               <div className="flex items-center gap-3 bg-gray-800 p-3 rounded border border-gray-600">
                  <input 
                    type="checkbox" 
                    checked={bank.enabled} 
                    onChange={(e) => onBankChange({ ...bank, enabled: e.target.checked })}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-500 text-minecraft-accent"
                  />
                  <div>
                    <span className="block text-sm font-medium text-white">Ativar Sistema de Banco</span>
                    <span className="text-xs text-gray-400">Permite depositar/sacar e saldo separado.</span>
                  </div>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsEditor;