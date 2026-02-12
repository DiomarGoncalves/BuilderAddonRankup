import React from 'react';
import { PlotConfig } from '../types';
import { Home, MapPin } from 'lucide-react';

interface PlotEditorProps {
  config: PlotConfig;
  onChange: (config: PlotConfig) => void;
}

const PlotEditor: React.FC<PlotEditorProps> = ({ config, onChange }) => {
  
  const handleChange = (field: keyof PlotConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const handleCoordChange = (axis: 'x' | 'y' | 'z', value: number) => {
    onChange({
      ...config,
      worldStart: { ...config.worldStart, [axis]: value }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-minecraft-gold flex items-center gap-2">
          <Home className="w-5 h-5" /> Configuração de Plots
        </h2>
        <div className="flex items-center gap-2">
           <label className="text-sm text-gray-400">Sistema Ativo?</label>
           <input 
             type="checkbox" 
             checked={config.enabled} 
             onChange={(e) => handleChange('enabled', e.target.checked)} 
             className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-minecraft-accent focus:ring-minecraft-accent"
           />
        </div>
      </div>

      <div className={`bg-minecraft-panel border border-gray-700 p-6 rounded-lg shadow-lg transition-opacity ${!config.enabled ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tamanho do Plot (Blocos)</label>
            <input
              type="number"
              value={config.plotSize}
              onChange={(e) => handleChange('plotSize', Number(e.target.value))}
              placeholder="32"
              className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white focus:border-minecraft-gold outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Ex: 32 gera terrenos de 32x32.</p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Custo para Comprar (/plot claim)</label>
            <input
              type="number"
              value={config.cost}
              onChange={(e) => handleChange('cost', Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white focus:border-minecraft-gold outline-none"
            />
          </div>

          <div className="md:col-span-2">
             <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
               <MapPin className="w-4 h-4" /> Ponto Inicial de Geração (Mundo Plots)
             </label>
             <div className="flex gap-4">
                <div className="flex-1">
                   <span className="text-xs text-gray-500 block mb-1">X</span>
                   <input type="number" value={config.worldStart.x} onChange={(e) => handleCoordChange('x', Number(e.target.value))} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-center" />
                </div>
                <div className="flex-1">
                   <span className="text-xs text-gray-500 block mb-1">Y</span>
                   <input type="number" value={config.worldStart.y} onChange={(e) => handleCoordChange('y', Number(e.target.value))} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-center" />
                </div>
                <div className="flex-1">
                   <span className="text-xs text-gray-500 block mb-1">Z</span>
                   <input type="number" value={config.worldStart.z} onChange={(e) => handleCoordChange('z', Number(e.target.value))} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-center" />
                </div>
             </div>
             <p className="text-xs text-gray-500 mt-2">A partir desta coordenada, os plots serão gerados em grid (ID 0, ID 1, ID 2...).</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PlotEditor;