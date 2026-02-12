import React from 'react';
import { ProtectionConfig } from '../types';
import { Shield, Lock, FileText, AlertTriangle } from 'lucide-react';

interface ProtectionEditorProps {
  config: ProtectionConfig;
  onChange: (config: ProtectionConfig) => void;
}

const ProtectionEditor: React.FC<ProtectionEditorProps> = ({ config, onChange }) => {
  
  const handleChange = (field: keyof ProtectionConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const handleAntiExploitChange = (field: keyof ProtectionConfig['antiExploit'], value: any) => {
    onChange({
      ...config,
      antiExploit: { ...config.antiExploit, [field]: value }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-minecraft-gold flex items-center gap-2">
          <Shield className="w-5 h-5" /> Segurança & Anti-Exploit
        </h2>
        <div className="flex items-center gap-2">
           <label className="text-sm text-gray-400">Ativar Módulo?</label>
           <input 
             type="checkbox" 
             checked={config.enabled} 
             onChange={(e) => handleChange('enabled', e.target.checked)} 
             className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-minecraft-accent"
           />
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!config.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
         
         {/* Mine Protection */}
         <div className="bg-minecraft-panel border border-gray-700 p-4 rounded-lg">
            <h3 className="text-sm font-bold text-gray-300 uppercase mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-400" /> Proteção de Minas
            </h3>
            
            <div className="space-y-4">
                <div className="flex items-center justify-between bg-gray-800 p-2 rounded">
                    <div>
                        <span className="block text-sm text-white">Proteger Estrutura</span>
                        <span className="text-[10px] text-gray-500">Impede quebrar paredes/chão da mina.</span>
                    </div>
                    <input 
                        type="checkbox"
                        checked={config.mineProtection}
                        onChange={(e) => handleChange('mineProtection', e.target.checked)}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500"
                    />
                </div>
                
                <div className="flex items-center justify-between bg-gray-800 p-2 rounded">
                    <div>
                        <span className="block text-sm text-white">Bloquear Construção</span>
                        <span className="text-[10px] text-gray-500">Impede colocar blocos dentro da mina.</span>
                    </div>
                    <input 
                        type="checkbox"
                        checked={!config.blockPlaceInMine} // Inverted logic in UI for clarity "Block" vs "Allow"
                        onChange={(e) => handleChange('blockPlaceInMine', !e.target.checked)}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-red-500"
                    />
                </div>
            </div>
         </div>

         {/* Anti-Exploit & Logs */}
         <div className="space-y-6">
             
             <div className="bg-minecraft-panel border border-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-bold text-gray-300 uppercase mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" /> Anti-Exploit
                </h3>
                
                <div className="space-y-2">
                    <label className="text-xs text-gray-500">Limite de Vendas (/minuto)</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="number"
                            value={config.antiExploit.maxSellPerMinute}
                            onChange={(e) => handleAntiExploitChange('maxSellPerMinute', Number(e.target.value))}
                            className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white"
                        />
                        <span className="text-xs text-gray-500 whitespace-nowrap">0 = Sem limite</span>
                    </div>
                    <p className="text-[10px] text-gray-600">Previne autoclickers e macros de venda excessivos.</p>
                </div>
             </div>

             <div className="bg-minecraft-panel border border-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-bold text-gray-300 uppercase mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" /> Logs Administrativos
                </h3>
                
                <div className="flex items-center justify-between bg-gray-800 p-2 rounded">
                    <div>
                        <span className="block text-sm text-white">Logs no Chat (Admin)</span>
                        <span className="text-[10px] text-gray-500">Avisa quando máquinas são colocadas ou NPCs editados.</span>
                    </div>
                    <input 
                        type="checkbox"
                        checked={config.adminLogs}
                        onChange={(e) => handleChange('adminLogs', e.target.checked)}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-green-500"
                    />
                </div>
             </div>

         </div>

      </div>
    </div>
  );
};

export default ProtectionEditor;