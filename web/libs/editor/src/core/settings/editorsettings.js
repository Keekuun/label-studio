import { FF_BITMASK } from "@humansignal/core/lib/utils/feature-flags";

export default {
  enableHotkeys: {
    newUI: {
      title: "enableHotkeys_newUI_title",
      description: "enableHotkeys_newUI_description",
    },
    description: "enableHotkeys_description",
    onChangeEvent: "toggleHotkeys",
    defaultValue: true,
  },
  enableTooltips: {
    newUI: {
      title: "enableTooltips_newUI_title",
      description: "enableTooltips_newUI_description",
    },
    description: "enableTooltips_description",
    onChangeEvent: "toggleTooltips",
    checked: "",
    defaultValue: false,
  },
  enableLabelTooltips: {
    newUI: {
      title: "enableLabelTooltips_newUI_title",
      description: "enableLabelTooltips_newUI_description",
    },
    description: "enableLabelTooltips_description",
    onChangeEvent: "toggleLabelTooltips",
    defaultValue: true,
  },
  showLabels: {
    newUI: {
      title: "showLabels_newUI_title",
      description: "showLabels_newUI_description",
    },
    description: "showLabels_description",
    onChangeEvent: "toggleShowLabels",
    defaultValue: false,
  },
  continuousLabeling: {
    newUI: {
      title: "continuousLabeling_newUI_title",
      description: "continuousLabeling_newUI_description",
    },
    description: "continuousLabeling_description",
    onChangeEvent: "toggleContinuousLabeling",
    defaultValue: false,
  },
  selectAfterCreate: {
    newUI: {
      title: "selectAfterCreate_newUI_title",
      description: "selectAfterCreate_newUI_description",
    },
    description: "selectAfterCreate_description",
    onChangeEvent: "toggleSelectAfterCreate",
    defaultValue: false,
  },
  showLineNumbers: {
    newUI: {
      tags: "showLineNumbers_newUI_tags",
      title: "showLineNumbers_newUI_title",
      description: "showLineNumbers_newUI_description",
    },
    description: "Show line numbers for Text",
    onChangeEvent: "toggleShowLineNumbers",
    defaultValue: false,
  },
  preserveSelectedTool: {
    newUI: {
      tags: "preserveSelectedTool_newUI_tags",
      title: "preserveSelectedTool_newUI_title",
      description: "preserveSelectedTool_newUI_description",
    },
    description: "preserveSelectedTool_description",
    onChangeEvent: "togglepreserveSelectedTool",
    defaultValue: true,
  },
  enableSmoothing: {
    newUI: {
      tags: "enableSmoothing_newUI_tags",
      title: "enableSmoothing_newUI_title",
      description: "enableSmoothing_newUI_description",
    },
    description: "enableSmoothing_description",
    onChangeEvent: "toggleSmoothing",
    defaultValue: true,
  },
  invertedZoom: {
    newUI: {
      tags: "invertedZoom_newUI_tags",
      title: "invertedZoom_newUI_title",
      description: "invertedZoom_newUI_description",
    },
    description: "invertedZoom_description",
    onChangeEvent: "toggleInvertedZoom",
    defaultValue: false,
    flag: FF_BITMASK,
  },
};
