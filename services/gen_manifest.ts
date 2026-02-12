import { AddonConfig, GeneratedFile } from "../types";

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const generateManifest = (config: AddonConfig): GeneratedFile => {
  const uuidHeader = generateUUID();
  const uuidData = generateUUID();
  const uuidScript = generateUUID();

  const manifest = {
    format_version: 2,
    header: {
      name: config.serverName,
      description: "Gerado por RankUP Architect",
      uuid: uuidHeader,
      version: [1, 0, 0],
      min_engine_version: [1, 20, 80]
    },
    modules: [
      {
        type: "data",
        uuid: uuidData,
        version: [1, 0, 0]
      },
      {
        type: "script",
        language: "javascript",
        uuid: uuidScript,
        version: [1, 0, 0],
        entry: "scripts/main.js"
      }
    ],
    dependencies: [
      { module_name: "@minecraft/server", version: "1.11.0" },
      { module_name: "@minecraft/server-ui", version: "1.2.0" }
    ]
  };

  return {
    path: "manifest.json",
    content: JSON.stringify(manifest, null, 2)
  };
};