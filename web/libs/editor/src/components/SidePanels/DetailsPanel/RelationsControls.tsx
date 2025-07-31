import { Button } from "@humansignal/ui";
import { observer } from "mobx-react";
import { type FC, useCallback } from "react";
import { Block, Elem } from "../../../utils/bem";
import "./RelationsControls.scss";
import { IconOutlinerEyeClosed, IconOutlinerEyeOpened, IconSortDown, IconSortUp } from "@humansignal/icons";
import i18n from "i18next";

const RelationsControlsComponent: FC<any> = ({ relationStore }) => {
  return (
    <Block name="relation-controls">
      <ToggleRelationsVisibilityButton relationStore={relationStore} />
      <ToggleRelationsOrderButton relationStore={relationStore} />
    </Block>
  );
};

interface ToggleRelationsVisibilityButtonProps {
  relationStore: any;
}

const ToggleRelationsVisibilityButton = observer<FC<ToggleRelationsVisibilityButtonProps>>(({ relationStore }) => {
  const toggleRelationsVisibility = useCallback(
    (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      relationStore.toggleAllVisibility();
    },
    [relationStore],
  );

  const isDisabled = !relationStore?.relations?.length;
  const isAllHidden = !(!isDisabled && relationStore.isAllHidden);

  return (
    <Elem
      tag={Button}
      variant="neutral"
      look="string"
      size="small"
      disabled={isDisabled}
      onClick={toggleRelationsVisibility}
      mod={{ hidden: isAllHidden }}
      aria-label={isAllHidden ? i18n.t('show_all') : i18n.t('hide_all')}
      icon={
        isAllHidden ? (
          <IconOutlinerEyeClosed width={16} height={16} />
        ) : (
          <IconOutlinerEyeOpened width={16} height={16} />
        )
      }
      tooltip={isAllHidden ? i18n.t('show_all') : i18n.t('hide_all')}
      tooltipTheme="dark"
    />
  );
});

interface ToggleRelationsOrderButtonProps {
  relationStore: any;
}

const ToggleRelationsOrderButton = observer<FC<ToggleRelationsOrderButtonProps>>(({ relationStore }) => {
  const toggleRelationsOrder = useCallback(
    (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      relationStore.toggleOrder();
    },
    [relationStore],
  );

  const isDisabled = !relationStore?.relations?.length;
  const isAsc = relationStore.order === "asc";

  return (
    <Elem
      tag={Button}
      variant="neutral"
      look="string"
      size="small"
      onClick={toggleRelationsOrder}
      disabled={isDisabled}
      mod={{ order: relationStore.order }}
      aria-label={isAsc ? i18n.t('order_by_old') : i18n.t('order_by_new')}
      icon={isAsc ? <IconSortUp /> : <IconSortDown />}
      tooltip={isAsc ? i18n.t('order_by_old') : i18n.t('order_by_new')}
      tooltipTheme="dark"
    />
  );
});

export const RelationsControls = observer(RelationsControlsComponent);
