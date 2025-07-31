import { observer } from "mobx-react";
import { Button, Tooltip } from "@humansignal/ui";
import Utils from "../../utils";
import { cn } from "../../utils/bem";

import "./DraftPanel.scss";
import i18n from "i18next";

const panel = cn("draft-panel");

export const DraftPanel = observer(({ item }) => {
  if (!item.draftSaved && !item.versions.draft) return null;
  const saved = item.draft && item.draftSaved ? ` ${i18n.t("saved")} ${Utils.UDate.prettyDate(item.draftSaved)}` : "";

  if (!item.selected) {
    if (!item.draft) return null;
    return <div className={panel}>${i18n.t("saved")}{saved}</div>;
  }
  if (!item.versions.result || !item.versions.result.length) {
    return <div className={panel}>{saved ? `${i18n.t("draft")}${saved}` : i18n.t("not_submitted_draft")}</div>;
  }
  return (
    <div className={panel}>
      <Tooltip
        alignment="top-left"
        title={item.draftSelected ? i18n.t('switch_to_ori') : i18n.t('switch_to_cur')}
      >
        <Button
          type="button"
          size="smaller"
          look="string"
          onClick={() => item.toggleDraft()}
          className={panel.elem("toggle")}
          aria-label="Toggle draft mode"
        >
          {item.draftSelected ? i18n.t("draft") : i18n.t("original")}
        </Button>
      </Tooltip>
      {saved}
    </div>
  );
});
