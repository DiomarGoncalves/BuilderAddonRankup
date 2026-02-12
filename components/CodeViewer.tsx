import React, { useState } from 'react';
import { GeneratedFile } from '../types';
import { Copy, FileCode, Check, Download, Package } from 'lucide-react';
// @ts-ignore
import JSZip from 'jszip';

interface CodeViewerProps {
  files: GeneratedFile[];
}

const CodeViewer: React.FC<CodeViewerProps> = ({ files }) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  if (files.length === 0) return null;

  const currentFile = files[selectedFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadArchive = async (extension: 'zip' | 'mcaddon') => {
    if (isZipping) return;
    setIsZipping(true);

    try {
      const zip = new JSZip();
      
      // If it's mcaddon, we usually wrap in a root folder, but flat is also accepted if manifest is at root.
      // Let's create a structure: RankUP_Addon/path/to/file
      // Or just map the paths provided by the AI.
      
      files.forEach(file => {
        // AI returns paths like "BP/scripts/main.js". 
        // We will keep this structure.
        zip.file(file.path, file.content);
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `RankUP_Addon.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error creating zip", error);
      alert("Erro ao criar arquivo ZIP.");
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-minecraft-dark border border-gray-700 rounded-lg overflow-hidden shadow-2xl">
      
      {/* Toolbar */}
      <div className="bg-gray-800 p-2 flex justify-between items-center border-b border-gray-700">
         <div className="flex gap-2 overflow-x-auto max-w-[60%]">
            {files.map((file, index) => (
              <button
                key={index}
                onClick={() => setSelectedFileIndex(index)}
                className={`px-3 py-1 flex items-center gap-2 text-xs font-mono whitespace-nowrap rounded transition-colors ${
                  selectedFileIndex === index
                    ? 'bg-minecraft-panel text-minecraft-gold border border-gray-600'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <FileCode className="w-3 h-3" />
                {file.path.split('/').pop()}
              </button>
            ))}
         </div>

         <div className="flex gap-2">
            <button
              onClick={() => downloadArchive('zip')}
              disabled={isZipping}
              className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
            >
              <Download className="w-3 h-3" />
              .ZIP
            </button>
            <button
              onClick={() => downloadArchive('mcaddon')}
              disabled={isZipping}
              className="flex items-center gap-2 px-3 py-1 bg-minecraft-accent hover:bg-green-700 text-white text-xs rounded transition-colors"
            >
              <Package className="w-3 h-3" />
              .MCADDON
            </button>
         </div>
      </div>

      <div className="relative flex-1 overflow-auto bg-[#1e1e1e] p-4">
        <div className="absolute top-2 right-4 text-xs text-gray-500 font-mono">
           {currentFile.path}
        </div>
        <button
          onClick={handleCopy}
          className="absolute top-8 right-4 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded shadow-lg transition-all z-10 flex items-center gap-2"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
        <pre className="font-mono text-sm text-gray-300 leading-relaxed pt-6">
          <code>{currentFile.content}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeViewer;