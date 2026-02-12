import React, { useState, useRef } from 'react';
import { AddonConfig, AppStatus, GeneratedFile } from './types';
import { INITIAL_CONFIG } from './constants';
import { generateAddonCode } from './services/generator';
import RankEditor from './components/RankEditor';
import SettingsEditor from './components/SettingsEditor';
import ShopSellEditor from './components/ShopSellEditor';
import PlotEditor from './components/PlotEditor';
import MachineEditor from './components/MachineEditor';
import BoostersEditor from './components/BoostersEditor';
import MissionsEditor from './components/MissionsEditor';
import ProtectionEditor from './components/ProtectionEditor';
import CodeViewer from './components/CodeViewer';
import { Hammer, Code, LayoutDashboard, Loader2, Play, Upload, Save, FileJson } from 'lucide-react';
import clsx from 'clsx';

const App: React.FC = () => {
  const [config, setConfig] = useState<AddonConfig>(INITIAL_CONFIG);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Ref for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    setStatus(AppStatus.GENERATING);
    setErrorMessage(null);
    try {
      const files = await generateAddonCode(config);
      setGeneratedFiles(files);
      setStatus(AppStatus.SUCCESS);
      setActiveTab('preview');
    } catch (error: any) {
      setStatus(AppStatus.ERROR);
      setErrorMessage(error.message || "Erro desconhecido ao gerar o addon.");
    }
  };

  // --- PRESET SYSTEM ---
  const handleExportPreset = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rankup-preset-${config.serverName.replace(/\s+/g, '_').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const parsed = JSON.parse(json);
        
        // Basic validation to ensure it's a valid config
        if (parsed.serverName && Array.isArray(parsed.ranks)) {
           setConfig(parsed);
           setStatus(AppStatus.IDLE); // Reset generation status
           setActiveTab('editor'); // Switch back to editor to see changes
           // Reset input value so same file can be selected again if needed
           if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
           alert("Arquivo inválido: Não parece ser um preset do RankUP Architect.");
        }
      } catch (err) {
        alert("Erro ao ler o arquivo JSON.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-screen bg-minecraft-dark text-gray-100 font-sans">
      {/* Hidden Input for Import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json" 
        className="hidden" 
      />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800 shadow-xl z-10">
        <div className="flex items-center gap-3">
          <div className="bg-minecraft-accent p-2 rounded-lg">
             <Hammer className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide text-white">RankUP Architect <span className="text-minecraft-gold text-sm font-normal ml-1">v2.0 (Builder)</span></h1>
            <p className="text-xs text-gray-500">Bedrock Addon Generator • Script API 1.11+</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
           {/* Preset Controls */}
           <div className="flex gap-2 border-r border-gray-700 pr-6">
              <button 
                onClick={handleImportClick}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-blue-400 border border-gray-700 rounded transition-colors"
                title="Carregar configuração de um arquivo JSON"
              >
                <Upload className="w-4 h-4" /> Importar Preset
              </button>
              <button 
                onClick={handleExportPreset}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-green-400 border border-gray-700 rounded transition-colors"
                title="Salvar configuração atual em JSON"
              >
                <Save className="w-4 h-4" /> Exportar Preset
              </button>
           </div>

           <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('editor')}
                className={clsx("flex items-center gap-2 px-4 py-2 rounded transition-all", activeTab === 'editor' ? "bg-gray-800 text-white" : "text-gray-500 hover:text-white")}
              >
                 <LayoutDashboard className="w-4 h-4" /> Editor
              </button>
              <button 
                onClick={() => setActiveTab('preview')}
                disabled={status !== AppStatus.SUCCESS}
                className={clsx("flex items-center gap-2 px-4 py-2 rounded transition-all", 
                  activeTab === 'preview' ? "bg-gray-800 text-white" : "text-gray-500 hover:text-white",
                  status !== AppStatus.SUCCESS && "opacity-50 cursor-not-allowed"
                )}
              >
                 <Code className="w-4 h-4" /> Código Gerado
              </button>
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative flex">
        
        {/* Editor Tab */}
        <div className={clsx("flex-1 overflow-y-auto p-8 transition-opacity duration-300 custom-scrollbar", activeTab === 'editor' ? "opacity-100 z-10" : "opacity-0 absolute inset-0 -z-10")}>
           <div className="max-w-4xl mx-auto space-y-12 pb-24">
              
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 shadow-2xl flex justify-between items-center">
                 <div className="max-w-xl">
                   <h3 className="text-white font-bold mb-2 flex items-center gap-2"><FileJson className="w-5 h-5 text-yellow-500"/> Sistema de Presets</h3>
                   <p className="text-gray-400 text-sm">
                     Use os botões de <b>Importar/Exportar</b> no topo para salvar seu progresso ou compartilhar sua configuração (Ranks, Economia, Máquinas) com amigos sem precisar enviar o código fonte.
                   </p>
                 </div>
              </div>

              <SettingsEditor 
                serverName={config.serverName}
                economy={config.economy}
                bank={config.bank}
                onServerNameChange={(val) => setConfig(prev => ({ ...prev, serverName: val }))}
                onEconomyChange={(val) => setConfig(prev => ({ ...prev, economy: val }))}
                onBankChange={(val) => setConfig(prev => ({ ...prev, bank: val }))}
              />
              
              <div className="border-t border-gray-800 pt-8">
                 <ProtectionEditor 
                   config={config.protection}
                   onChange={(protection) => setConfig(prev => ({ ...prev, protection }))}
                 />
              </div>

              <div className="border-t border-gray-800 pt-8">
                 <MissionsEditor 
                    config={config.missions}
                    onChange={(missions) => setConfig(prev => ({ ...prev, missions }))}
                 />
              </div>

              <div className="border-t border-gray-800 pt-8">
                <BoostersEditor 
                   config={config.boosters}
                   onChange={(boosters) => setConfig(prev => ({ ...prev, boosters }))}
                />
              </div>

              <div className="border-t border-gray-800 pt-8">
                 <RankEditor 
                   ranks={config.ranks} 
                   onChange={(ranks) => setConfig(prev => ({ ...prev, ranks }))} 
                 />
              </div>

              <div className="border-t border-gray-800 pt-8">
                 <MachineEditor 
                   machines={config.machines || []} 
                   onChange={(machines) => setConfig(prev => ({ ...prev, machines }))} 
                 />
              </div>

              <div className="border-t border-gray-800 pt-8">
                 <ShopSellEditor
                   shopItems={config.shop}
                   sellItems={config.sellItems}
                   onShopChange={(shop) => setConfig(prev => ({ ...prev, shop }))}
                   onSellChange={(sellItems) => setConfig(prev => ({ ...prev, sellItems }))}
                 />
              </div>

              <div className="border-t border-gray-800 pt-8">
                 <PlotEditor 
                   config={config.plots}
                   onChange={(plots) => setConfig(prev => ({ ...prev, plots }))}
                 />
              </div>

           </div>
        </div>

        {/* Preview Tab */}
        <div className={clsx("flex-1 p-4 flex flex-col transition-opacity duration-300", activeTab === 'preview' ? "opacity-100 z-10" : "opacity-0 absolute inset-0 -z-10")}>
           {status === AppStatus.SUCCESS ? (
             <div className="h-full flex flex-col max-w-6xl mx-auto w-full">
                <div className="mb-4 flex items-center justify-between">
                   <h2 className="text-xl font-bold text-green-400">Addon Gerado com Sucesso!</h2>
                   <p className="text-sm text-gray-500">Baixe o .mcaddon ou copie os arquivos manualmente.</p>
                </div>
                <CodeViewer files={generatedFiles} />
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Code className="w-16 h-16 mb-4 opacity-20" />
                <p>Nenhum código gerado ainda.</p>
             </div>
           )}
        </div>

        {/* Floating Action Bar */}
        <div className="absolute bottom-0 left-0 w-full bg-[#151515]/90 backdrop-blur-sm border-t border-gray-800 p-4 flex justify-center z-50">
           {status === AppStatus.ERROR && (
             <div className="absolute -top-16 bg-red-900/90 text-red-200 px-6 py-3 rounded-lg border border-red-700 shadow-xl animate-bounce">
               Erro: {errorMessage}
             </div>
           )}

           <button
             onClick={handleGenerate}
             disabled={status === AppStatus.GENERATING}
             className={clsx(
               "flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg shadow-2xl transition-all transform hover:scale-105 active:scale-95",
               status === AppStatus.GENERATING 
                 ? "bg-gray-700 text-gray-400 cursor-wait" 
                 : "bg-gradient-to-r from-minecraft-accent to-green-600 text-white hover:shadow-green-900/50"
             )}
           >
             {status === AppStatus.GENERATING ? (
               <>
                 <Loader2 className="w-6 h-6 animate-spin" />
                 Compilando Addon...
               </>
             ) : (
               <>
                 <Play className="w-6 h-6 fill-current" />
                 Gerar Addon RankUP
               </>
             )}
           </button>
        </div>

      </main>
    </div>
  );
};

export default App;