import type { SettingsProperties } from "./types";

export default {
  videoDrawOutside: {
    description: "videoDrawOutside_description",
    defaultValue: false,
    type: "boolean",
  },
  videoHopSize: {
    description: "videoHopSize_description",
    defaultValue: 10,
    type: "number",
  },
} as SettingsProperties;
