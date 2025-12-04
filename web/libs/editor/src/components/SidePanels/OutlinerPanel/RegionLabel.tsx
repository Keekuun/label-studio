import { observer } from "mobx-react";
import { cn } from "../../../utils/bem";
import i18n from "i18next";

export type RegionLabelProps = {
  item: any;
};
export const RegionLabel = observer(({ item }: RegionLabelProps) => {
  const { type } = item ?? {};
  if (!type) {
    return i18n.t('no_label');
  }
  // 标尺区域：显示 Line-1 / Line-2，并用区域颜色渲染
  if (type === "rulerregion") {
    const index = typeof item.lineIndex === "number" && item.lineIndex >= 0 ? item.lineIndex + 1 : null;
    const label = index != null ? `Line-${index}` : i18n.t('no_label');
    const color = item.color ?? "#000000";

    return (
      <div className={cn("labels-list").toClassName()} style={{ color }}>
        {label}
      </div>
    );
  }
  if (type.includes("label")) {
    return item.value;
  }
  if (type.includes("region") || type.includes("range")) {
    const labelsInResults = item.labelings.map((result: any) => result.selectedLabels || []);

    const labels: any[] = [].concat(...labelsInResults);

    return (
      <div className={cn("labels-list").toClassName()}>
        {labels.map((label, index) => {
          const color = label.background || "#000000";

          return [
            index ? ", " : null,
            // This comes from an Elem tag that was set without a name. The CSS was fixed to make it work,
            // but this is clearly bad CSS usage.
            <div key={label.id} className={cn("labels-list").toClassName()} style={{ color }}>
              {label.value || i18n.t('no_label')}
            </div>,
          ];
        })}
      </div>
    );
  }
  if (type.includes("tool")) {
    return item.value;
  }
});
