import { GoogleGenAI, Type } from "@google/genai";
import { AddonConfig, GeneratedFile } from "../types";
import { TECHNICAL_PROMPT_TEMPLATE } from "../constants";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateAddonCode = async (config: AddonConfig): Promise<GeneratedFile[]> => {
  if (!apiKey) {
    throw new Error("API Key não encontrada. Configure process.env.API_KEY.");
  }

  const userConfigStr = JSON.stringify(config, null, 2);

  const prompt = `
    Você é um Arquiteto de Software Sênior especializado em Minecraft Bedrock Addons (Script API).
    
    Tarefa: Gerar o código fonte COMPLETO para um addon de RankUP seguindo rigorosamente a arquitetura solicitada.
    
    Configuração Específica do Usuário (Injete estes dados no arquivo core/config.js):
    ${userConfigStr}
    
    DEFINIÇÃO DE ARQUITETURA E REGRAS (Prompt Técnico):
    ${TECHNICAL_PROMPT_TEMPLATE}
    
    Instruções de Saída:
    1. Gere TODOS os arquivos listados na estrutura obrigatória.
    2. NÃO ESQUEÇA do 'manifest.json' (com dependências @minecraft/server e @minecraft/server-ui).
    3. O código deve ser funcional e pronto para uso (copy-paste).
    4. Mantenha os nomes dos arquivos exatamente como solicitado (ex: scripts/features/mines.js).
    
    Formato de Resposta:
    Retorne EXCLUSIVAMENTE um JSON com o array de arquivos gerados.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            files: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  path: { type: Type.STRING, description: "Caminho do arquivo, ex: scripts/main.js ou manifest.json" },
                  content: { type: Type.STRING, description: "Conteúdo completo do código fonte do arquivo" }
                },
                required: ["path", "content"]
              }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Resposta vazia da IA");

    const parsed = JSON.parse(jsonText);
    return parsed.files || [];
    
  } catch (error) {
    console.error("Erro ao gerar código:", error);
    throw error;
  }
};