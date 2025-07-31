import { observer } from "mobx-react";
import { IconRedo, IconRemove, IconUndo } from "@humansignal/icons";
import { Tooltip, Button, Space } from "@humansignal/ui";
import "./HistoryActions.scss";
import i18n from "i18next";

export const EditingHistory = observer(({ entity }) => {
  const { history } = entity;

  return (
    <Space size="small">
      <Tooltip title={i18n.t('undo')}>
        <Button
          variant="neutral"
          size="small"
          aria-label="Undo"
          look="string"
          disabled={!history?.canUndo}
          onClick={() => entity.undo()}
          className="!p-0"
        >
          <IconUndo />
        </Button>
      </Tooltip>
      <Tooltip title={i18n.t('redo')}>
        <Button
          variant="neutral"
          size="small"
          look="string"
          aria-label="Redo"
          disabled={!history?.canRedo}
          onClick={() => entity.redo()}
          className="!p-0"
        >
          <IconRedo />
        </Button>
      </Tooltip>
      <Tooltip title={i18n.t('reset')}>
        <Button
          variant="negative"
          look="string"
          size="small"
          aria-label="Reset"
          disabled={!history?.canUndo}
          onClick={() => history?.reset()}
          className="!p-0"
        >
          <IconRemove />
        </Button>
      </Tooltip>
    </Space>
  );
});
