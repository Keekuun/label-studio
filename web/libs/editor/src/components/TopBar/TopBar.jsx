import { observer } from "mobx-react";

import { IconViewAll, IconPlus } from "@humansignal/icons";
import { Button } from "@humansignal/ui";
import { ff } from "@humansignal/core";
import { Block, Elem } from "../../utils/bem";
import { isSelfServe } from "../../utils/billing";
import { FF_BULK_ANNOTATION, FF_DEV_3873, isFF } from "../../utils/feature-flags";
import { AnnotationsCarousel } from "../AnnotationsCarousel/AnnotationsCarousel";
import { DynamicPreannotationsToggle } from "../AnnotationTab/DynamicPreannotationsToggle";
import { Actions } from "./Actions";
import { Annotations } from "./Annotations";
import { Controls } from "./Controls";
import { CurrentTask } from "./CurrentTask";
import i18n from "i18next"

import "./TopBar.scss";

export const TopBar = observer(({ store }) => {
  const annotationStore = store.annotationStore;
  const entity = annotationStore?.selected;
  const isPrediction = entity?.type === "prediction";

  const isViewAll = annotationStore?.viewingAll === true;
  const isBulkMode = isFF(FF_BULK_ANNOTATION) && !isSelfServe() && store.hasInterface("annotation:bulk");

  if (isFF(FF_DEV_3873) && isBulkMode) return null;

  return store ? (
    <Block name="topbar" mod={{ newLabelingUI: isFF(FF_DEV_3873) }}>
      {isFF(FF_DEV_3873) ? (
        <Elem name="group">
          <CurrentTask store={store} />
          {store.hasInterface("annotations:view-all") && (
            <Button
              className={"topbar__button"}
              type={isViewAll ? undefined : "string"}
              aria-label={i18n.t('compare_all_anno')}
              onClick={annotationStore.toggleViewingAllAnnotations}
              variant={isViewAll ? "primary" : "neutral"}
              look={isViewAll ? "filled" : "string"}
              tooltip={i18n.t('compare_all_anno')}
              size="small"
            >
              <IconViewAll />
            </Button>
          )}
          {store.hasInterface("annotations:add-new") && (
            <Button
              className={"topbar__button"}
              type={isViewAll ? undefined : "text"}
              aria-label={i18n.t('create_anno')}
              variant="neutral"
              size="small"
              look="string"
              tooltip={i18n.t('create_anno')}
              onClick={(event) => {
                event.preventDefault();
                const created = store.annotationStore.createAnnotation();

                store.annotationStore.selectAnnotation(created.id);
              }}
            >
              <IconPlus />
            </Button>
          )}
          {(!isViewAll || ff.isActive(ff.FF_SUMMARY)) && (
            <AnnotationsCarousel
              store={store}
              annotationStore={store.annotationStore}
              commentStore={store.commentStore}
            />
          )}
        </Elem>
      ) : (
        <>
          <Elem name="group">
            {!isBulkMode && <CurrentTask store={store} />}
            {!isViewAll && !isBulkMode && (
              <Annotations store={store} annotationStore={store.annotationStore} commentStore={store.commentStore} />
            )}
            <Actions store={store} />
          </Elem>
          <Elem name="group">
            {!isViewAll && (
              <Elem name="section">
                <DynamicPreannotationsToggle />
              </Elem>
            )}
            {!isViewAll && store.hasInterface("controls") && (store.hasInterface("review") || !isPrediction) && (
              <Elem name="section" mod={{ flat: true }} style={{ width: 320, boxSizing: "border-box" }}>
                <Controls annotation={entity} />
              </Elem>
            )}
          </Elem>
        </>
      )}
    </Block>
  ) : null;
});
