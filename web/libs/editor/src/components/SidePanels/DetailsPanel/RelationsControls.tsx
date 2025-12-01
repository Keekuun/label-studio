import { Button } from "@humansignal/ui";
import { observer } from "mobx-react";
import { type FC, useCallback } from "react";
import { cn } from "../../../utils/bem";
import "./RelationsControls.scss";
import { IconOutlinerEyeClosed, IconOutlinerEyeOpened, IconSortDown, IconSortUp } from "@humansignal/icons";
import i18n from "i18next";

const RelationsControlsComponent: FC<any> = ({ relationStore }) => {
  return (
    <div className={cn("relation-controls").toClassName()}>
      <ToggleRelationsVisibilityButton relationStore={relationStore} />
      <ToggleRelationsOrderButton relationStore={relationStore} />
    </div>
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

  // This comes from an Elem tag that was set without a name. The CSS was fixed to make it work,
  // but this is clearly bad CSS usage.
  return (
    <Button
      className={cn("relation-controls").mod({ hidden: isAllHidden }).toClassName()}
      variant="neutral"
      look="string"
      size="small"
      disabled={isDisabled}
      onClick={toggleRelationsVisibility}
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

  // This comes from an Elem tag that was set without a name. The CSS was fixed to make it work,
  // but this is clearly bad CSS usage.
  return (
    <Button
      className={cn("relation-controls").mod({ order: relationStore.order }).toClassName()}
      variant="neutral"
      look="string"
      size="small"
      onClick={toggleRelationsOrder}
      disabled={isDisabled}
      aria-label={isAsc ? i18n.t('order_by_old') : i18n.t('order_by_new')}
      icon={isAsc ? <IconSortUp /> : <IconSortDown />}
      tooltip={isAsc ? i18n.t('order_by_old') : i18n.t('order_by_new')}
      tooltipTheme="dark"
    />
  );
});

export const RelationsControls = observer(RelationsControlsComponent);
