import type { MouseEventHandler } from "react";

import { IconCommentLinkTo, IconSend } from "@humansignal/icons";
import { Tooltip } from "@humansignal/ui";
import { Block, Elem } from "../../../utils/bem";
import "./CommentFormButtons.scss";
import i18n from "i18next";

export const CommentFormButtons = ({
  region,
  linking,
  onLinkTo,
}: { region: any; linking: boolean; onLinkTo?: MouseEventHandler<HTMLElement> }) => (
  <Block name="comment-form-buttons">
    <Elem name="buttons">
      {onLinkTo && !region && (
        <Tooltip title={i18n.t('link_to')}>
          <Elem name="action" tag="button" mod={{ highlight: linking }} onClick={onLinkTo}>
            <IconCommentLinkTo />
          </Elem>
        </Tooltip>
      )}
      <Elem name="action" tag="button" type="submit">
        <IconSend />
      </Elem>
    </Elem>
  </Block>
);
