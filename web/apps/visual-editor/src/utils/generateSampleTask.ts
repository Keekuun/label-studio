import { generateSampleTaskFromConfig as playgroundGenerate } from "../../../playground/src/utils/generateSampleTask";

/**
 * 包装 playground 的 generateSampleTaskFromConfig
 * - 避免 double-wrap：如果传入的 config 已包含 <View>，则直接使用；否则包一层 <View>
 */
export async function generateSampleTaskFromConfig(config: string) {
  const trimmed = (config || "").trim();
  const hasViewTag = trimmed.startsWith("<View") || trimmed.startsWith("<view");
  const normalized = hasViewTag ? config : `<View>${config}</View>`;
  return playgroundGenerate(normalized);
}

